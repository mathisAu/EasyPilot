package com.easypilot.backend.documenttype;

import jakarta.validation.constraints.NotNull;

public record DocumentTypeStatusRequest(@NotNull(message = "Status is verplicht") RequestStatus status) {
}
