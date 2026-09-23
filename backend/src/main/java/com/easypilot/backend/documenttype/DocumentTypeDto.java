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
        Long latestDocumentId,
        Long organizationId,
        String organizationName,
        Long folderId,
        String folderName,
        Instant createdAt,
        Instant updatedAt
) {

    /** Folders are an internal admin tool, so a customer's view never carries them. */
    public DocumentTypeDto withoutFolder() {
        return new DocumentTypeDto(id, name, provider, status, fields, documentCount, latestDocumentFilename,
                latestDocumentId, organizationId, organizationName, null, null, createdAt, updatedAt);
    }

    public static DocumentTypeDto from(DocumentType entity) {
        Document latestDocument = entity.getDocuments().stream()
                .max(Comparator.comparing(Document::getUploadedAt))
                .orElse(null);
        return new DocumentTypeDto(
                entity.getId(),
                entity.getName(),
                entity.getProvider(),
                entity.getStatus().name(),
                new ArrayList<>(entity.getFields()),
                entity.getDocuments().size(),
                latestDocument != null ? latestDocument.getOriginalFilename() : null,
                latestDocument != null ? latestDocument.getId() : null,
                entity.getOrganization() != null ? entity.getOrganization().getId() : null,
                entity.getOrganization() != null ? entity.getOrganization().getName() : null,
                entity.getFolder() != null ? entity.getFolder().getId() : null,
                entity.getFolder() != null ? entity.getFolder().getName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
