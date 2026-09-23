package com.easypilot.backend.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageBodyRequest(
        @NotBlank(message = "Bericht is verplicht")
        @Size(max = 5000, message = "Bericht mag maximaal 5000 tekens zijn") String body
) {
}
