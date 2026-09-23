package com.easypilot.backend.extraction;

import jakarta.validation.constraints.NotBlank;

public record ExtractedFieldUpdateRequest(
        @NotBlank(message = "Veldnaam is verplicht") String fieldName,
        String value,
        boolean included
) {
}
