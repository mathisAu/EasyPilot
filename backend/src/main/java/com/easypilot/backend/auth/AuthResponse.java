package com.easypilot.backend.auth;

public record AuthResponse(String username, String role, Long organizationId, String organizationName) {
}
