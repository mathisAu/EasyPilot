package com.easypilot.backend.account;

import com.easypilot.backend.auth.AuthResponse;
import com.easypilot.backend.common.BadRequestException;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.CurrentUserService;
import com.easypilot.backend.user.TotpService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AppUserRepository appUserRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final TotpService totpService;
    private final AdminAccountService adminAccountService;

    public AccountController(AppUserRepository appUserRepository, CurrentUserService currentUserService,
                              PasswordEncoder passwordEncoder, TotpService totpService,
                              AdminAccountService adminAccountService) {
        this.appUserRepository = appUserRepository;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
        this.totpService = totpService;
        this.adminAccountService = adminAccountService;
    }

    @PatchMapping("/profile")
    @Transactional
    public ResponseEntity<AuthResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                        Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        user.setDisplayName(blankToNull(request.displayName()));
        user.setEmail(blankToNull(request.email()));
        appUserRepository.save(user);
        return ResponseEntity.ok(toAuthResponse(user));
    }

    @PostMapping("/password")
    @Transactional
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Huidig wachtwoord is onjuist");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/2fa/setup")
    @Transactional
    public ResponseEntity<TotpSetupResponse> setupTwoFactor(Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);
        user.setTotpEnabled(false);
        appUserRepository.save(user);
        return ResponseEntity.ok(new TotpSetupResponse(secret, totpService.buildOtpAuthUri(secret, user.getUsername())));
    }

    @PostMapping("/2fa/enable")
    @Transactional
    public ResponseEntity<AuthResponse> enableTwoFactor(@Valid @RequestBody TotpCodeRequest request,
                                                          Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        if (user.getTotpSecret() == null || !totpService.verifyCode(user.getTotpSecret(), request.code())) {
            throw new BadRequestException("Ongeldige verificatiecode. Probeer het opnieuw.");
        }
        user.setTotpEnabled(true);
        appUserRepository.save(user);
        return ResponseEntity.ok(toAuthResponse(user));
    }

    @PostMapping("/2fa/disable")
    @Transactional
    public ResponseEntity<AuthResponse> disableTwoFactor(@Valid @RequestBody TotpCodeRequest request,
                                                           Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        if (!user.isTotpEnabled() || !totpService.verifyCode(user.getTotpSecret(), request.code())) {
            throw new BadRequestException("Ongeldige verificatiecode. Probeer het opnieuw.");
        }
        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        appUserRepository.save(user);
        return ResponseEntity.ok(toAuthResponse(user));
    }

    @DeleteMapping("/admin/users/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable String username, Authentication authentication) {
        adminAccountService.deleteAccount(username, currentUserService.require(authentication));
        return ResponseEntity.noContent().build();
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AuthResponse toAuthResponse(AppUser user) {
        Long organizationId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String organizationName = user.getOrganization() != null ? user.getOrganization().getName() : null;
        return new AuthResponse(user.getUsername(), user.getDisplayName(), user.getEmail(), user.getRole().name(),
                organizationId, organizationName, user.isTotpEnabled());
    }
}
