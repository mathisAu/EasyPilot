package com.easypilot.backend.extraction;

public final class GeminiClientHolder {

    private final String apiKey;
    private final String model;

    private GeminiClientHolder(String apiKey, String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public static GeminiClientHolder available(String apiKey, String model) {
        return new GeminiClientHolder(apiKey, model);
    }

    public static GeminiClientHolder unavailable() {
        return new GeminiClientHolder(null, null);
    }

    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String apiKey() {
        return apiKey;
    }

    public String model() {
        return model;
    }

    public String unavailableReason() {
        return "GEMINI_API_KEY is niet geconfigureerd.";
    }
}
