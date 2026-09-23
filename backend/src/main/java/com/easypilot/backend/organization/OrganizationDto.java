package com.easypilot.backend.organization;

import java.time.Instant;

public record OrganizationDto(
        Long id,
        String name,
        String customerUsername,
        int documentTypeCount,
        Instant createdAt,
        String address,
        String postalCode,
        String city,
        String kvkNumber,
        String vatNumber,
        String website,
        String contactName,
        String contactEmail,
        String contactPhone
) {
}
