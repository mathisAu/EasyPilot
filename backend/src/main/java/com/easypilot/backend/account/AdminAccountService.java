package com.easypilot.backend.account;

import com.easypilot.backend.auth.PasswordResetTokenRepository;
import com.easypilot.backend.auth.RegistrationTokenRepository;
import com.easypilot.backend.common.BadRequestException;
import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.notification.NotificationRepository;
import com.easypilot.backend.organization.Organization;
import com.easypilot.backend.organization.OrganizationRepository;
import com.easypilot.backend.support.SupportTicket;
import com.easypilot.backend.support.SupportTicketRepository;
import com.easypilot.backend.support.TicketMessageRepository;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAccountService {

    private final AppUserRepository appUserRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RegistrationTokenRepository registrationTokenRepository;
    private final NotificationRepository notificationRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final TicketMessageRepository ticketMessageRepository;

    public AdminAccountService(AppUserRepository appUserRepository,
                               OrganizationRepository organizationRepository,
                               PasswordResetTokenRepository passwordResetTokenRepository,
                               RegistrationTokenRepository registrationTokenRepository,
                               NotificationRepository notificationRepository,
                               SupportTicketRepository supportTicketRepository,
                               TicketMessageRepository ticketMessageRepository) {
        this.appUserRepository = appUserRepository;
        this.organizationRepository = organizationRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.registrationTokenRepository = registrationTokenRepository;
        this.notificationRepository = notificationRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.ticketMessageRepository = ticketMessageRepository;
    }

    @Transactional
    public void deleteAccount(String username, AppUser administrator) {
        AppUser user = appUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account niet gevonden"));

        if (user.getId().equals(administrator.getId())) {
            throw new BadRequestException("Je kunt je eigen beheerderaccount niet hier verwijderen.");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Beheerderaccounts kunnen niet via klantbeheer worden verwijderd.");
        }

        Long userId = user.getId();
        Organization organization = user.getOrganization();
        boolean deleteOrganization = organization != null
            && appUserRepository.findAllByOrganizationId(organization.getId()).size() == 1;
        notificationRepository.deleteByRecipientId(userId);
        passwordResetTokenRepository.deleteByUserId(userId);
        registrationTokenRepository.deleteByUserId(userId);
        ticketMessageRepository.deleteByAuthorId(userId);

        for (SupportTicket ticket : supportTicketRepository.findByCreatedById(userId)) {
            ticketMessageRepository.deleteByTicketId(ticket.getId());
            supportTicketRepository.delete(ticket);
        }

        if (deleteOrganization) {
            for (SupportTicket ticket : supportTicketRepository.findByOrganizationIdOrderByUpdatedAtDesc(organization.getId())) {
                ticketMessageRepository.deleteByTicketId(ticket.getId());
                supportTicketRepository.delete(ticket);
            }
        }

        appUserRepository.delete(user);
        if (deleteOrganization) {
            organizationRepository.delete(organization);
        }
    }
}
