package com.easypilot.backend.auth;

import com.easypilot.backend.common.ApiErrorResponse;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.TotpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final TotpService totpService;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager, AppUserRepository appUserRepository,
                           TotpService totpService) {
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.totpService = totpService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));

            AppUser appUser = appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                    .orElseThrow(() -> new IllegalStateException("Ingelogde gebruiker niet gevonden"));

            if (appUser.isTotpEnabled()) {
                String code = request.totpCode();
                if (code == null || code.isBlank() || !totpService.verifyCode(appUser.getTotpSecret(), code)) {
                    return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED)
                            .body(new TotpRequiredResponse(true, "Voer de 6-cijferige code uit je authenticator-app in"));
                }
            }

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);

            return ResponseEntity.ok(toAuthResponse(appUser));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(ApiErrorResponse.of("Ongeldige gebruikersnaam of wachtwoord"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(ApiErrorResponse.of("Niet ingelogd"));
        }
        AppUser appUser = appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Ingelogde gebruiker niet gevonden"));
        return ResponseEntity.ok(toAuthResponse(appUser));
    }

    private AuthResponse toAuthResponse(AppUser appUser) {
        Long organizationId = appUser.getOrganization() != null ? appUser.getOrganization().getId() : null;
        String organizationName = appUser.getOrganization() != null ? appUser.getOrganization().getName() : null;
        return new AuthResponse(appUser.getUsername(), appUser.getDisplayName(), appUser.getEmail(),
                appUser.getRole().name(), organizationId, organizationName, appUser.isTotpEnabled());
    }
}
