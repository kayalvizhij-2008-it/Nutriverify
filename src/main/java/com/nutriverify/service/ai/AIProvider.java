package com.nutriverify.service.ai;

import com.nutriverify.entity.AnalysisHistoryEntity;

/**
 * Interface for AI response providers (External LLM vs Local Deterministic Engine).
 */
public interface AIProvider {
    /**
     * Generate a response for a user question under optional analysis context and target language.
     */
    AIResult generateResponse(String userPrompt, AnalysisHistoryEntity context, String language);

    /**
     * Check if this provider is configured and operational.
     */
    boolean isAvailable();

    /**
     * Provider identification name.
     */
    String getProviderName();
}
