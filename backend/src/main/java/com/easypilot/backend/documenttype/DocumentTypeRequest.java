package com.easypilot.backend.documenttype;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record DocumentTypeRequest(
        @NotBlank(message = "Naam is verplicht") String name,
        @NotBlank(message = "Provider is verplicht") String provider,
        RequestStatus status,
        List<String> fields
) {
}
