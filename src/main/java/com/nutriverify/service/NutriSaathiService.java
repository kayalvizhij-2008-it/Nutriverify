package com.nutriverify.service;

import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.service.ai.AIProviderRouter;
import com.nutriverify.service.ai.AIResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * NutriSaathi - Hybrid Conversational AI assistant service.
 * Delegates to AIProviderRouter to invoke External Generative AI when configured,
 * or fallback to the verified local deterministic domain engine.
 */
@Service
public class NutriSaathiService {

    private final AIProviderRouter router;

    public NutriSaathiService(AIProviderRouter router) {
        this.router = router;
    }

    /**
     * Process message returning full AIResult (content + provider metadata).
     */
    public AIResult processMessageDetails(String message, AnalysisHistoryEntity analysisContext, String language) {
        return router.routeAndExecute(message, analysisContext, language);
    }

    /**
     * Process message returning raw response string (backwards compatible).
     */
    public String processMessage(String message, AnalysisHistoryEntity analysisContext, String language) {
        return processMessageDetails(message, analysisContext, language).getContent();
    }

    /**
     * Get suggested follow-up questions.
     */
    public List<String> getSuggestedFollowUps(String lastMessage, AnalysisHistoryEntity context) {
        List<String> suggestions = new ArrayList<>();
        if (context != null) {
            suggestions.add("Why is this product's health score " + context.getHealthScore() + "?");
            suggestions.add("What ingredients should I watch?");
            suggestions.add("Are there allergens in this product?");
            suggestions.add("Are any of the claims questionable?");
            suggestions.add("Give me a short summary");
        } else {
            suggestions.add("What is sodium?");
            suggestions.add("How much protein should I eat daily?");
            suggestions.add("What are the best sources of fiber?");
            suggestions.add("Help me analyze a food product");
        }
        return suggestions;
    }

    public boolean isExternalAIAvailable() {
        return router.isExternalAIAvailable();
    }
}
