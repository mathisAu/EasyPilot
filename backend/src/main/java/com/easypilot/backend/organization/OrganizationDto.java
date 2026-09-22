package com.easypilot.backend.organization;

import java.time.Instant;

public record OrganizationDto(
        Long id,
        String name,
        String customerUsername,
        int documentTypeCount,
        Instant createdAt
) {
}
