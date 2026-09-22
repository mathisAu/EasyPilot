package com.easypilot.backend.extraction;

import com.anthropic.client.AnthropicClient;

public final class AnthropicClientHolder {

    private final AnthropicClient client;
    private final String unavailableReason;

    private AnthropicClientHolder(AnthropicClient client, String unavailableReason) {
        this.client = client;
        this.unavailableReason = unavailableReason;
    }

    public static AnthropicClientHolder available(AnthropicClient client) {
        return new AnthropicClientHolder(client, null);
    }

    public static AnthropicClientHolder unavailable(String reason) {
        return new AnthropicClientHolder(null, reason);
    }

    public boolean isAvailable() {
        return client != null;
    }

    public AnthropicClient client() {
        return client;
    }

    public String unavailableReason() {
        return unavailableReason;
    }
}
