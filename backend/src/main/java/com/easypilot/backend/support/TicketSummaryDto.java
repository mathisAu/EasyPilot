package com.easypilot.backend.support;

import java.time.Instant;

public record TicketSummaryDto(
        Long id,
        String subject,
        TicketStatus status,
        String organizationName,
        String createdByName,
        long messageCount,
        /** ADMIN or CUSTOMER: who wrote the latest message, i.e. who is waiting on whom. */
        String lastMessageAuthorRole,
        Instant createdAt,
        Instant updatedAt
) {
}
