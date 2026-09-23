package com.easypilot.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "E-mailadres is verplicht")
        @Email(message = "Vul een geldig e-mailadres in") String email
) {
}
