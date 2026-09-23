package com.easypilot.backend.support;

import java.time.Instant;

public record TicketMessageDto(
        Long id,
        String authorName,
        String authorRole,
        String body,
        boolean edited,
        boolean mine,
        Instant createdAt,
        Instant updatedAt
) {
}
