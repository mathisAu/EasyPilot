package com.easypilot.backend.support;

import jakarta.validation.constraints.Size;

/** subject is only used for new-ticket drafts; reply drafts ignore it. */
public record TicketDraftRequest(
        @Size(max = 150, message = "Onderwerp mag maximaal 150 tekens zijn") String subject,
        @Size(max = 5000, message = "Bericht mag maximaal 5000 tekens zijn") String body
) {
}
