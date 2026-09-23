package com.easypilot.backend.support;

import com.easypilot.backend.common.BadRequestException;
import com.easypilot.backend.common.RateLimitedException;
import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class SupportTicketService {

    private static final Duration TICKET_COOLDOWN = Duration.ofSeconds(60);
    private static final Duration MESSAGE_COOLDOWN = Duration.ofSeconds(5);

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;

    public SupportTicketService(SupportTicketRepository ticketRepository, TicketMessageRepository messageRepository) {
        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional(readOnly = true)
    public List<TicketSummaryDto> listTickets(AppUser user) {
        List<SupportTicket> tickets;
        if (user.getRole() == Role.ADMIN) {
            tickets = ticketRepository.findAllByOrderByUpdatedAtDesc();
        } else if (user.getOrganization() != null) {
            tickets = ticketRepository.findByOrganizationIdOrderByUpdatedAtDesc(user.getOrganization().getId());
        } else {
            tickets = List.of();
        }
        return tickets.stream().map(this::toSummaryDto).toList();
    }

    @Transactional
    public TicketDetailDto createTicket(CreateTicketRequest request, AppUser user) {
        Instant cutoff = Instant.now().minus(TICKET_COOLDOWN);
        if (ticketRepository.existsByCreatedByIdAndCreatedAtAfter(user.getId(), cutoff)) {
            throw rateLimited("Je kunt maar om de minuut een nieuw ticket aanmaken.", cutoff, TICKET_COOLDOWN);
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(request.subject().trim());
        ticket.setCreatedBy(user);
        ticket.setOrganization(user.getOrganization());
        ticket = ticketRepository.save(ticket);

        TicketMessage message = new TicketMessage();
        message.setTicket(ticket);
        message.setAuthor(user);
        message.setBody(request.message().trim());
        messageRepository.save(message);

        return toDetailDto(ticket, List.of(message), user);
    }

    @Transactional(readOnly = true)
    public TicketDetailDto getTicket(Long ticketId, AppUser user) {
        SupportTicket ticket = getAccessibleTicket(ticketId, user);
        List<TicketMessage> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return toDetailDto(ticket, messages, user);
    }

    @Transactional
    public TicketMessageDto addMessage(Long ticketId, MessageBodyRequest request, AppUser user) {
        SupportTicket ticket = getAccessibleTicket(ticketId, user);
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Dit ticket is gesloten. Heropen het ticket om te reageren.");
        }

        Instant cutoff = Instant.now().minus(MESSAGE_COOLDOWN);
        if (messageRepository.existsByAuthorIdAndCreatedAtAfter(user.getId(), cutoff)) {
            throw rateLimited("Even wachten voor je opnieuw een bericht stuurt.", cutoff, MESSAGE_COOLDOWN);
        }

        TicketMessage message = new TicketMessage();
        message.setTicket(ticket);
        message.setAuthor(user);
        message.setBody(request.body().trim());
        messageRepository.save(message);

        ticket.touch();
        ticketRepository.save(ticket);

        return toMessageDto(message, user);
    }

    @Transactional
    public TicketMessageDto editMessage(Long ticketId, Long messageId, MessageBodyRequest request, AppUser user) {
        TicketMessage message = getOwnMessage(ticketId, messageId, user);
        message.setBody(request.body().trim());
        message.setEdited(true);
        message.setUpdatedAt(Instant.now());
        messageRepository.save(message);
        return toMessageDto(message, user);
    }

    @Transactional
    public void deleteMessage(Long ticketId, Long messageId, AppUser user) {
        TicketMessage message = getOwnMessage(ticketId, messageId, user);
        messageRepository.delete(message);
    }

    @Transactional
    public TicketDetailDto updateStatus(Long ticketId, UpdateTicketStatusRequest request, AppUser user) {
        SupportTicket ticket = getAccessibleTicket(ticketId, user);
        ticket.setStatus(request.status());
        ticket.touch();
        ticketRepository.save(ticket);
        List<TicketMessage> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return toDetailDto(ticket, messages, user);
    }

    private TicketMessage getOwnMessage(Long ticketId, Long messageId, AppUser user) {
        getAccessibleTicket(ticketId, user);
        TicketMessage message = messageRepository.findById(messageId)
                .filter(m -> m.getTicket().getId().equals(ticketId))
                .orElseThrow(() -> new ResourceNotFoundException("Bericht niet gevonden"));
        if (!message.getAuthor().getId().equals(user.getId())) {
            throw new AccessDeniedException("Je kunt alleen je eigen berichten bewerken of verwijderen");
        }
        return message;
    }

    private SupportTicket getAccessibleTicket(Long ticketId, AppUser user) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket niet gevonden"));
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean sameOrganization = ticket.getOrganization() != null && user.getOrganization() != null
                && ticket.getOrganization().getId().equals(user.getOrganization().getId());
        boolean isCreator = ticket.getCreatedBy().getId().equals(user.getId());
        if (!isAdmin && !sameOrganization && !isCreator) {
            throw new AccessDeniedException("Geen toegang tot dit ticket");
        }
        return ticket;
    }

    private RateLimitedException rateLimited(String message, Instant cutoff, Duration cooldown) {
        long retryAfter = Duration.between(Instant.now(), cutoff.plus(cooldown)).getSeconds() + 1;
        return new RateLimitedException(message, Math.max(retryAfter, 1));
    }

    private TicketSummaryDto toSummaryDto(SupportTicket ticket) {
        return new TicketSummaryDto(
                ticket.getId(),
                ticket.getSubject(),
                ticket.getStatus(),
                ticket.getOrganization() != null ? ticket.getOrganization().getName() : null,
                displayName(ticket.getCreatedBy()),
                messageRepository.countByTicketId(ticket.getId()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }

    private TicketDetailDto toDetailDto(SupportTicket ticket, List<TicketMessage> messages, AppUser requester) {
        return new TicketDetailDto(
                ticket.getId(),
                ticket.getSubject(),
                ticket.getStatus(),
                ticket.getOrganization() != null ? ticket.getOrganization().getName() : null,
                displayName(ticket.getCreatedBy()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                messages.stream().map(message -> toMessageDto(message, requester)).toList()
        );
    }

    private TicketMessageDto toMessageDto(TicketMessage message, AppUser requester) {
        return new TicketMessageDto(
                message.getId(),
                displayName(message.getAuthor()),
                message.getAuthor().getRole().name(),
                message.getBody(),
                message.isEdited(),
                message.getAuthor().getId().equals(requester.getId()),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }

    private String displayName(AppUser user) {
        return user.getDisplayName() != null && !user.getDisplayName().isBlank()
                ? user.getDisplayName()
                : user.getUsername();
    }
}
