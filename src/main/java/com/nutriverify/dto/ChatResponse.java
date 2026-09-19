package com.nutriverify.dto;

import java.util.List;

/**
 * DTO for chat response.
 */
public class ChatResponse {
    private String response;
    private String language;
    private List<String> suggestedFollowUps;
    private String timestamp;

    public ChatResponse() {}

    public ChatResponse(String response, String language, List<String> suggestedFollowUps, String timestamp) {
        this.response = response;
        this.language = language;
        this.suggestedFollowUps = suggestedFollowUps;
        this.timestamp = timestamp;
    }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public List<String> getSuggestedFollowUps() { return suggestedFollowUps; }
    public void setSuggestedFollowUps(List<String> suggestedFollowUps) { this.suggestedFollowUps = suggestedFollowUps; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
