package com.easypilot.backend.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotBlank(message = "Onderwerp is verplicht")
        @Size(max = 150, message = "Onderwerp mag maximaal 150 tekens zijn") String subject,
        @NotBlank(message = "Bericht is verplicht")
        @Size(max = 5000, message = "Bericht mag maximaal 5000 tekens zijn") String message
) {
}
