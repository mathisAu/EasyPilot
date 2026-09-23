package com.easypilot.backend.support;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.user.AppUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TicketDraftService {

    private final TicketDraftRepository draftRepository;
    private final SupportTicketService ticketService;

    public TicketDraftService(TicketDraftRepository draftRepository, SupportTicketService ticketService) {
        this.draftRepository = draftRepository;
        this.ticketService = ticketService;
    }

    @Transactional(readOnly = true)
    public List<TicketDraftDto> listDrafts(AppUser user) {
        return draftRepository.findByAuthorIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(TicketDraftDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<TicketDraftDto> getReplyDraft(Long ticketId, AppUser user) {
        ticketService.getAccessibleTicket(ticketId, user);
        return draftRepository.findByAuthorIdAndTicketId(user.getId(), ticketId).map(TicketDraftDto::from);
    }

    /** Saving an empty reply removes the draft, so clearing the text box also clears the concept. */
    @Transactional
    public Optional<TicketDraftDto> saveReplyDraft(Long ticketId, String body, AppUser user) {
        SupportTicket ticket = ticketService.getAccessibleTicket(ticketId, user);
        if (body == null || body.isBlank()) {
            draftRepository.deleteByAuthorIdAndTicketId(user.getId(), ticketId);
            return Optional.empty();
        }
        TicketDraft draft = draftRepository.findByAuthorIdAndTicketId(user.getId(), ticketId).orElseGet(() -> {
            TicketDraft created = new TicketDraft();
            created.setAuthor(user);
            created.setTicket(ticket);
            return created;
        });
        draft.setBody(body);
        return Optional.of(TicketDraftDto.from(draftRepository.save(draft)));
    }

    @Transactional
    public TicketDraftDto createNewTicketDraft(TicketDraftRequest request, AppUser user) {
        TicketDraft draft = new TicketDraft();
        draft.setAuthor(user);
        apply(draft, request);
        return TicketDraftDto.from(draftRepository.save(draft));
    }

    @Transactional
    public TicketDraftDto updateNewTicketDraft(Long draftId, TicketDraftRequest request, AppUser user) {
        TicketDraft draft = getOwnNewTicketDraft(draftId, user);
        apply(draft, request);
        return TicketDraftDto.from(draftRepository.save(draft));
    }

    @Transactional
    public void deleteDraft(Long draftId, AppUser user) {
        TicketDraft draft = draftRepository.findById(draftId)
                .filter(found -> found.getAuthor().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Concept niet gevonden"));
        draftRepository.delete(draft);
    }

    private TicketDraft getOwnNewTicketDraft(Long draftId, AppUser user) {
        return draftRepository.findById(draftId)
                .filter(found -> found.getAuthor().getId().equals(user.getId()) && found.getTicket() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Concept niet gevonden"));
    }

    private void apply(TicketDraft draft, TicketDraftRequest request) {
        draft.setSubject(request.subject() != null ? request.subject().trim() : null);
        draft.setBody(request.body());
    }
}
