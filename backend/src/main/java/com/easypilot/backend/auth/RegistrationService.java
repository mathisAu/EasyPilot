package com.easypilot.backend.auth;

import com.easypilot.backend.common.BadRequestException;
import com.easypilot.backend.common.ConflictException;
import com.easypilot.backend.common.MessageResponse;
import com.easypilot.backend.common.RateLimitedException;
import com.easypilot.backend.email.EmailService;
import com.easypilot.backend.organization.Organization;
import com.easypilot.backend.organization.OrganizationRepository;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RegistrationService {

    private static final Duration IP_COOLDOWN = Duration.ofHours(1);
    private static final Duration EMAIL_COOLDOWN = Duration.ofMinutes(2);
    private static final Duration TOKEN_VALIDITY = Duration.ofHours(24);
    private static final int MAX_REGISTRATIONS_PER_IP = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppUserRepository appUserRepository;
    private final OrganizationRepository organizationRepository;
    private final RegistrationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Map<String, RegistrationWindow> ipWindows = new ConcurrentHashMap<>();
    private final Map<String, Instant> emailWindows = new ConcurrentHashMap<>();

    public RegistrationService(AppUserRepository appUserRepository,
                               OrganizationRepository organizationRepository,
                               RegistrationTokenRepository tokenRepository,
                               PasswordEncoder passwordEncoder,
                               EmailService emailService) {
        this.appUserRepository = appUserRepository;
        this.organizationRepository = organizationRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public synchronized RegistrationResponse register(RegisterRequest request, String remoteAddress) {
        if (!emailService.isConfigured()) {
            throw new BadRequestException("Account aanmaken is tijdelijk niet beschikbaar omdat e-mail nog niet is geconfigureerd.");
        }
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();
        enforceRateLimit(remoteAddress, email);

        if (appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Deze gebruikersnaam is al in gebruik");
        }
        if (appUserRepository.findFirstByEmailIgnoreCase(email).isPresent()) {
            throw new ConflictException("Dit e-mailadres is al in gebruik");
        }

        Organization organization = new Organization();
        organization.setName(request.organizationName().trim());
        organization = organizationRepository.save(organization);

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setDisplayName(request.displayName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setOrganization(organization);
        user.setEmailVerified(false);
        user = appUserRepository.save(user);

        String rawToken = generateToken();
        RegistrationToken token = new RegistrationToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(Instant.now().plus(TOKEN_VALIDITY));
        tokenRepository.save(token);
        if (!emailService.sendRegistrationVerificationEmail(user, rawToken)) {
            throw new BadRequestException("De bevestigingsmail kon niet worden verstuurd. Probeer het later opnieuw.");
        }

        return new RegistrationResponse("We hebben een bevestigingslink naar je e-mailadres gestuurd.", email);
    }

    @Transactional
    public MessageResponse verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("Deze bevestigingslink is ongeldig.");
        }
        RegistrationToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .filter(item -> !item.isUsed() && item.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new BadRequestException("Deze bevestigingslink is ongeldig of verlopen."));

        AppUser user = token.getUser();
        user.setEmailVerified(true);
        appUserRepository.save(user);
        tokenRepository.findByUserIdAndUsedFalse(user.getId()).forEach(item -> item.setUsed(true));
        token.setUsed(true);
        return new MessageResponse("Je e-mailadres is bevestigd. Je kunt nu inloggen.");
    }

    private void enforceRateLimit(String remoteAddress, String email) {
        Instant now = Instant.now();
        String ip = remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
        RegistrationWindow window = ipWindows.compute(ip, (key, current) -> {
            if (current == null || current.startedAt().plus(IP_COOLDOWN).isBefore(now)) {
                return new RegistrationWindow(now, 1);
            }
            return new RegistrationWindow(current.startedAt(), current.count() + 1);
        });
        if (window.count() > MAX_REGISTRATIONS_PER_IP) {
            long retryAfter = Math.max(1, Duration.between(now, window.startedAt().plus(IP_COOLDOWN)).toSeconds());
            throw new RateLimitedException("Te veel registratiepogingen vanaf dit netwerk. Probeer later opnieuw.", retryAfter);
        }

        Instant previous = emailWindows.putIfAbsent(email, now);
        if (previous != null && previous.plus(EMAIL_COOLDOWN).isAfter(now)) {
            long retryAfter = Math.max(1, Duration.between(now, previous.plus(EMAIL_COOLDOWN)).toSeconds());
            throw new RateLimitedException("Wacht even voordat je opnieuw een account met dit e-mailadres aanvraagt.", retryAfter);
        }
        emailWindows.put(email, now);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getUrlEncoder().withoutPadding().encodeToString(
                    digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private record RegistrationWindow(Instant startedAt, int count) {
    }
}
