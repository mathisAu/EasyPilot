package com.easypilot.backend.extraction;

import java.time.Instant;

public record ExtractedFieldDto(
        String fieldName,
        String value,
        boolean edited,
        boolean included,
        boolean hasLocation,
        Instant updatedAt
) {

    public static ExtractedFieldDto from(ExtractedField entity) {
        return new ExtractedFieldDto(
                entity.getFieldName(),
                entity.getValue(),
                entity.isEdited(),
                entity.isIncluded(),
                entity.hasBox(),
                entity.getUpdatedAt()
        );
    }
}
