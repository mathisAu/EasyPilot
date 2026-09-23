package com.easypilot.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Naam is verplicht")
        @Size(max = 120, message = "Naam mag maximaal 120 tekens bevatten")
        String displayName,
        @NotBlank(message = "E-mailadres is verplicht")
        @Email(message = "Vul een geldig e-mailadres in")
        String email,
        @NotBlank(message = "Gebruikersnaam is verplicht")
        @Size(min = 3, max = 50, message = "Gebruikersnaam moet 3 tot 50 tekens bevatten")
        String username,
        @NotBlank(message = "Wachtwoord is verplicht")
        @Size(min = 8, max = 128, message = "Wachtwoord moet 8 tot 128 tekens bevatten")
        String password,
        @NotBlank(message = "Organisatienaam is verplicht")
        @Size(max = 160, message = "Organisatienaam mag maximaal 160 tekens bevatten")
        String organizationName
) {
}
