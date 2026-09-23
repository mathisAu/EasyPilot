package com.easypilot.backend.account;

public record TotpSetupResponse(String secret, String otpAuthUri) {
}
