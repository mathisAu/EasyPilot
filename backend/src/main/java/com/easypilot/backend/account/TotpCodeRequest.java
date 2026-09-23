package com.easypilot.backend.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TotpCodeRequest(
        @NotBlank(message = "Verificatiecode is verplicht")
        @Pattern(regexp = "\\d{6}", message = "Verificatiecode moet 6 cijfers zijn") String code
) {
}
