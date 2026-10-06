package com.nutriverify.service.ai;

/**
 * Result wrapper for NutriVerify AI provider execution.
 */
public class AIResult {
    private final String content;
    private final String providerType; // "EXTERNAL_AI" or "DETERMINISTIC_FALLBACK"
    private final String statusLabel;  // "AI-powered", "Verified fallback", or "AI configuration required"
    private final boolean fallback;

    public AIResult(String content, String providerType, String statusLabel, boolean fallback) {
        this.content = content;
        this.providerType = providerType;
        this.statusLabel = statusLabel;
        this.fallback = fallback;
    }

    public static AIResult externalAi(String content) {
        return new AIResult(content, "EXTERNAL_AI", "AI-powered", false);
    }

    public static AIResult verifiedFallback(String content) {
        return new AIResult(content, "DETERMINISTIC_FALLBACK", "Verified fallback", true);
    }

    public static AIResult unconfiguredFallback(String content) {
        return new AIResult(content, "DETERMINISTIC_FALLBACK", "AI configuration required", true);
    }

    public String getContent() { return content; }
    public String getProviderType() { return providerType; }
    public String getStatusLabel() { return statusLabel; }
    public boolean isFallback() { return fallback; }
}
