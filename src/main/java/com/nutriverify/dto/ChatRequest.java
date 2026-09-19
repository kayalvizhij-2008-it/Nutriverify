package com.nutriverify.dto;

import java.util.List;

/**
 * DTO for chat/conversation requests.
 */
public class ChatRequest {
    private String message;
    private Long analysisContextId; // Optional: link to specific analysis
    private String language; // Optional: response language

    public ChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getAnalysisContextId() { return analysisContextId; }
    public void setAnalysisContextId(Long analysisContextId) { this.analysisContextId = analysisContextId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
