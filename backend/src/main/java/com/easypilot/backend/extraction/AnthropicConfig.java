package com.easypilot.backend.extraction;

import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AnthropicConfig {

    private static final Logger log = LoggerFactory.getLogger(AnthropicConfig.class);

    @Bean
    public AnthropicClientHolder anthropicClientHolder() {
        try {
            return AnthropicClientHolder.available(AnthropicOkHttpClient.fromEnv());
        } catch (Exception e) {
            log.warn("Anthropic-client kon niet worden aangemaakt (ontbreekt ANTHROPIC_API_KEY?): {}", e.getMessage());
            return AnthropicClientHolder.unavailable("ANTHROPIC_API_KEY is niet geconfigureerd.");
        }
    }
}
