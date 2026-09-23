package com.easypilot.backend.account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100, message = "Naam mag maximaal 100 tekens zijn") String displayName,
        @Email(message = "Vul een geldig e-mailadres in") @Size(max = 255) String email
) {
}
