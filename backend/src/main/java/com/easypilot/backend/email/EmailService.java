package com.easypilot.backend.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.easypilot.backend.user.AppUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final int RESET_TOKEN_VALIDITY_MINUTES = 30;
    private static final int REGISTRATION_TOKEN_VALIDITY_HOURS = 24;

    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String fromAddress;
    private final String frontendUrl;

    public EmailService(ObjectMapper objectMapper,
                         @Value("${app.email.resend-api-key}") String apiKey,
                         @Value("${app.email.from}") String fromAddress,
                         @Value("${app.frontend-url}") String frontendUrl) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
    }

    public void sendPasswordResetEmail(AppUser user, String rawToken) {
        String resetUrl = frontendUrl + "/reset-password?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        String html = EmailTemplates.passwordReset(displayName(user), resetUrl, RESET_TOKEN_VALIDITY_MINUTES);
        send(user.getEmail(), "Wachtwoord resetten voor EasyPilot", html);
    }

    public void sendPasswordChangedNotification(AppUser user) {
        String html = EmailTemplates.passwordChanged(displayName(user));
        send(user.getEmail(), "Je EasyPilot-wachtwoord is gewijzigd", html);
    }

    public boolean sendRegistrationVerificationEmail(AppUser user, String rawToken) {
        String verificationUrl = frontendUrl + "/verify-email?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        String html = EmailTemplates.registrationVerification(displayName(user), verificationUrl,
                REGISTRATION_TOKEN_VALIDITY_HOURS);
        return send(user.getEmail(), "Bevestig je EasyPilot-account", html);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private boolean send(String to, String subject, String html) {
        if (!isConfigured()) {
            log.warn("RESEND_API_KEY is niet geconfigureerd; e-mail naar {} niet verstuurd", to);
            return false;
        }
        try {
            Map<String, Object> payload = Map.of(
                    "from", fromAddress,
                    "to", List.of(to),
                    "subject", subject,
                    "html", html
            );
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.error("Resend gaf een foutstatus ({}) terug bij versturen naar {}: {}", response.statusCode(), to, response.body());
                return false;
            }
            return true;
        } catch (Exception e) {
            log.error("Kon e-mail niet versturen naar {}", to, e);
            return false;
        }
    }

    private String displayName(AppUser user) {
        return user.getDisplayName() != null && !user.getDisplayName().isBlank()
                ? user.getDisplayName()
                : user.getUsername();
    }
}
