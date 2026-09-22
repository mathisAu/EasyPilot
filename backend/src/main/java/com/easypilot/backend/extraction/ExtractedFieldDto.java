package com.easypilot.backend.extraction;

import java.time.Instant;

public record ExtractedFieldDto(
        String fieldName,
        String value,
        boolean edited,
        Instant updatedAt
) {

    public static ExtractedFieldDto from(ExtractedField entity) {
        return new ExtractedFieldDto(
                entity.getFieldName(),
                entity.getValue(),
                entity.isEdited(),
                entity.getUpdatedAt()
        );
    }
}
