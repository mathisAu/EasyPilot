package com.easypilot.backend.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token is verplicht") String token,
        @NotBlank(message = "Nieuw wachtwoord is verplicht")
        @Size(min = 6, max = 100, message = "Nieuw wachtwoord moet minimaal 6 tekens zijn") String newPassword
) {
}
