package com.easypilot.backend.support;

import java.time.Instant;
import java.util.List;

public record TicketDetailDto(
        Long id,
        String subject,
        TicketStatus status,
        String organizationName,
        String createdByName,
        Instant createdAt,
        Instant updatedAt,
        List<TicketMessageDto> messages
) {
}
