package com.easypilot.backend.support;

import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequest(@NotNull(message = "Status is verplicht") TicketStatus status) {
}
