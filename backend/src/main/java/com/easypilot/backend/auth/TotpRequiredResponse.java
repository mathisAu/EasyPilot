package com.easypilot.backend.auth;

public record TotpRequiredResponse(boolean requiresTotp, String message) {
}
