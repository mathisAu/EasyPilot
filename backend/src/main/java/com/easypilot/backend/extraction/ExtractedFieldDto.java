package com.easypilot.backend.extraction;

import java.time.Instant;

/**
 * box* are fractions (0-1) of the page from the top-left, null when the field's
 * location is unknown. confidence is the model's 0-1 certainty, null if unknown.
 */
public record ExtractedFieldDto(
        String fieldName,
        String value,
        boolean edited,
        boolean included,
        boolean hasLocation,
        Integer boxPage,
        Double boxX,
        Double boxY,
        Double boxWidth,
        Double boxHeight,
        Double confidence,
        boolean corrected,
        Instant updatedAt
) {

    public static ExtractedFieldDto from(ExtractedField entity) {
        return new ExtractedFieldDto(
                entity.getFieldName(),
                entity.getValue(),
                entity.isEdited(),
                entity.isIncluded(),
                entity.hasBox(),
                entity.getBoxPage(),
                entity.getBoxX(),
                entity.getBoxY(),
                entity.getBoxWidth(),
                entity.getBoxHeight(),
                entity.getConfidence(),
                entity.isCorrected(),
                entity.getUpdatedAt()
        );
    }
}
