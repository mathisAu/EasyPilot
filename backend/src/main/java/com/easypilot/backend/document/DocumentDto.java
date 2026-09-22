package com.easypilot.backend.document;

import java.time.Instant;

public record DocumentDto(
        Long id,
        Long documentTypeId,
        String filename,
        String contentType,
        long sizeBytes,
        Instant uploadedAt,
        String downloadUrl
) {

    public static DocumentDto from(Document entity) {
        return new DocumentDto(
                entity.getId(),
                entity.getDocumentType().getId(),
                entity.getOriginalFilename(),
                entity.getContentType(),
                entity.getSizeBytes(),
                entity.getUploadedAt(),
                "/api/documents/" + entity.getId() + "/download"
        );
    }
}
