package com.easypilot.backend.auth;

import com.easypilot.backend.common.MessageResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private static final String GENERIC_MESSAGE =
            "Als dit e-mailadres bekend is, hebben we een resetlink gestuurd.";

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
        return ResponseEntity.ok(new MessageResponse(GENERIC_MESSAGE));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
