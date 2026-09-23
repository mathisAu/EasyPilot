package com.easypilot.backend.auth;

public record LoginRequest(String username, String password, String totpCode) {
}
