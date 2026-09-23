package com.easypilot.backend.support;

import java.time.Instant;

/** ticketId/ticketSubject are set for a reply draft, null for a new-ticket draft. */
public record TicketDraftDto(
        Long id,
        Long ticketId,
        String ticketSubject,
        String subject,
        String body,
        Instant updatedAt
) {

    public static TicketDraftDto from(TicketDraft draft) {
        SupportTicket ticket = draft.getTicket();
        return new TicketDraftDto(
                draft.getId(),
                ticket != null ? ticket.getId() : null,
                ticket != null ? ticket.getSubject() : null,
                draft.getSubject(),
                draft.getBody(),
                draft.getUpdatedAt()
        );
    }
}
