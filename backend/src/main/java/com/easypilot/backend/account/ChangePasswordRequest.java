package com.easypilot.backend.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Huidig wachtwoord is verplicht") String currentPassword,
        @NotBlank(message = "Nieuw wachtwoord is verplicht")
        @Size(min = 6, max = 100, message = "Nieuw wachtwoord moet minimaal 6 tekens zijn") String newPassword
) {
}
