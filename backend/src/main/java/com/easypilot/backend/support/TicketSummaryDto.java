package com.easypilot.backend.support;

import java.time.Instant;

public record TicketSummaryDto(
        Long id,
        String subject,
        TicketStatus status,
        String organizationName,
        String createdByName,
        long messageCount,
        Instant createdAt,
        Instant updatedAt
) {
}
