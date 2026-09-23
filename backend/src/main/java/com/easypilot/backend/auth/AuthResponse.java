package com.easypilot.backend.auth;

public record AuthResponse(
        String username,
        String displayName,
        String email,
        String role,
        Long organizationId,
        String organizationName,
        boolean totpEnabled
) {
}
