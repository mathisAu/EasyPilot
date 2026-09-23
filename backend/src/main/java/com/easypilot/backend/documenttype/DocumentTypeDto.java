package com.easypilot.backend.documenttype;

import com.easypilot.backend.document.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public record DocumentTypeDto(
        Long id,
        String name,
        String provider,
        String status,
        List<String> fields,
        int documentCount,
        String latestDocumentFilename,
        Long organizationId,
        String organizationName,
        Instant createdAt,
        Instant updatedAt
) {

    public static DocumentTypeDto from(DocumentType entity) {
        String latestDocumentFilename = entity.getDocuments().stream()
                .max(Comparator.comparing(Document::getUploadedAt))
                .map(Document::getOriginalFilename)
                .orElse(null);
        return new DocumentTypeDto(
                entity.getId(),
                entity.getName(),
                entity.getProvider(),
                entity.getStatus().name(),
                new ArrayList<>(entity.getFields()),
                entity.getDocuments().size(),
                latestDocumentFilename,
                entity.getOrganization() != null ? entity.getOrganization().getId() : null,
                entity.getOrganization() != null ? entity.getOrganization().getName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
