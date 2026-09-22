package com.easypilot.backend.documenttype;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public record DocumentTypeDto(
        Long id,
        String name,
        String provider,
        boolean live,
        List<String> fields,
        int documentCount,
        Long organizationId,
        String organizationName,
        Instant createdAt,
        Instant updatedAt
) {

    public static DocumentTypeDto from(DocumentType entity) {
        return new DocumentTypeDto(
                entity.getId(),
                entity.getName(),
                entity.getProvider(),
                entity.isLive(),
                new ArrayList<>(entity.getFields()),
                entity.getDocuments().size(),
                entity.getOrganization() != null ? entity.getOrganization().getId() : null,
                entity.getOrganization() != null ? entity.getOrganization().getName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
