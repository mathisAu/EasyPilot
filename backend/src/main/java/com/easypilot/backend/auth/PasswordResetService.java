package com.easypilot.backend.auth;

import com.easypilot.backend.common.BadRequestException;
import com.easypilot.backend.email.EmailService;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final Duration REQUEST_COOLDOWN = Duration.ofMinutes(2);
    private static final Duration TOKEN_VALIDITY = Duration.ofMinutes(30);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppUserRepository appUserRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(AppUserRepository appUserRepository, PasswordResetTokenRepository tokenRepository,
                                 PasswordEncoder passwordEncoder, EmailService emailService) {
        this.appUserRepository = appUserRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Always behaves the same way regardless of whether the email is known, to avoid
     * leaking which addresses have an account (user enumeration).
     */
    @Transactional
    public void requestReset(String email) {
        Optional<AppUser> maybeUser = appUserRepository.findFirstByEmailIgnoreCase(email.trim());
        if (maybeUser.isEmpty()) {
            log.debug("Wachtwoord-reset aangevraagd voor onbekend e-mailadres");
            return;
        }
        AppUser user = maybeUser.get();

        Instant cutoff = Instant.now().minus(REQUEST_COOLDOWN);
        if (tokenRepository.existsByUserIdAndCreatedAtAfter(user.getId(), cutoff)) {
            log.debug("Wachtwoord-reset voor gebruiker {} genegeerd (cooldown actief)", user.getId());
            return;
        }

        tokenRepository.findByUserIdAndUsedFalse(user.getId()).forEach(existing -> existing.setUsed(true));

        String rawToken = generateToken();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(Instant.now().plus(TOKEN_VALIDITY));
        tokenRepository.save(token);

        emailService.sendPasswordResetEmail(user, rawToken);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .filter(t -> !t.isUsed() && t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new BadRequestException("Deze link is ongeldig of verlopen. Vraag een nieuwe aan."));

        AppUser user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);

        tokenRepository.findByUserIdAndUsedFalse(user.getId()).forEach(t -> t.setUsed(true));

        emailService.sendPasswordChangedNotification(user);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
