package com.easypilot.backend.extraction;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GeminiConfig {

    @Bean
    public GeminiClientHolder geminiClientHolder(@Value("${app.ai.gemini.api-key}") String apiKey,
                                                  @Value("${app.ai.gemini.model}") String model) {
        if (apiKey == null || apiKey.isBlank()) {
            return GeminiClientHolder.unavailable();
        }
        return GeminiClientHolder.available(apiKey, model);
    }

    @Bean
    public RestClient geminiRestClient() {
        return RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }
}
