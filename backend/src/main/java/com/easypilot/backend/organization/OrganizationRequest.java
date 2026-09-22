package com.easypilot.backend.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrganizationRequest(
        @NotBlank(message = "Naam is verplicht") String name,
        @NotBlank(message = "Gebruikersnaam is verplicht") String customerUsername,
        @NotBlank(message = "Wachtwoord is verplicht") @Size(min = 6, message = "Wachtwoord moet minimaal 6 tekens zijn") String customerPassword
) {
}
