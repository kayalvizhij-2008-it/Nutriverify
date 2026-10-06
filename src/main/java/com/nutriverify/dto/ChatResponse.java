package com.nutriverify.dto;

import java.util.List;

/**
 * DTO for NutriVerify AI chat responses with provider metadata.
 */
public class ChatResponse {
    private String response;
    private String language;
    private List<String> suggestedFollowUps;
    private String timestamp;
    private String providerType; // "EXTERNAL_AI" or "DETERMINISTIC_FALLBACK"
    private String statusLabel;  // "AI-powered", "Verified fallback", or "AI configuration required"
    private String contextProductName;
    private boolean fallback;

    public ChatResponse() {}

    public ChatResponse(String response, String language, List<String> suggestedFollowUps, String timestamp) {
        this.response = response;
        this.language = language;
        this.suggestedFollowUps = suggestedFollowUps;
        this.timestamp = timestamp;
        this.providerType = "DETERMINISTIC_FALLBACK";
        this.statusLabel = "Verified fallback";
    }

    public ChatResponse(String response, String language, List<String> suggestedFollowUps,
                        String timestamp, String providerType, String statusLabel,
                        String contextProductName, boolean fallback) {
        this.response = response;
        this.language = language;
        this.suggestedFollowUps = suggestedFollowUps;
        this.timestamp = timestamp;
        this.providerType = providerType;
        this.statusLabel = statusLabel;
        this.contextProductName = contextProductName;
        this.fallback = fallback;
    }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public List<String> getSuggestedFollowUps() { return suggestedFollowUps; }
    public void setSuggestedFollowUps(List<String> suggestedFollowUps) { this.suggestedFollowUps = suggestedFollowUps; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getProviderType() { return providerType; }
    public void setProviderType(String providerType) { this.providerType = providerType; }
    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }
    public String getContextProductName() { return contextProductName; }
    public void setContextProductName(String contextProductName) { this.contextProductName = contextProductName; }
    public boolean isFallback() { return fallback; }
    public void setFallback(boolean fallback) { this.fallback = fallback; }
}
