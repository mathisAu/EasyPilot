package com.easypilot.backend.extraction;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
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
        // Without an explicit timeout, a slow/overloaded Gemini response (its free
        // tier does return 503s under load) leaves the request hanging forever,
        // and the document sits stuck on IN_PROGRESS with no error ever surfaced.
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(15_000);
        requestFactory.setReadTimeout(45_000);

        return RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .requestFactory(requestFactory)
                .build();
    }
}
