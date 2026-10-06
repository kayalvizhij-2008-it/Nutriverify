package com.nutriverify.service.ai;

import com.nutriverify.entity.AnalysisHistoryEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * AI Provider Router for Hybrid NutriSaathi.
 * Routes requests to External LLM when configured, with automatic seamless fallback
 * to the deterministic domain-rule engine if external AI is unconfigured or fails.
 */
@Component
public class AIProviderRouter {

    private static final Logger log = LoggerFactory.getLogger(AIProviderRouter.class);

    private final ExternalLLMProvider externalLLMProvider;
    private final DeterministicNutriSaathiProvider deterministicProvider;

    public AIProviderRouter(ExternalLLMProvider externalLLMProvider,
                            DeterministicNutriSaathiProvider deterministicProvider) {
        this.externalLLMProvider = externalLLMProvider;
        this.deterministicProvider = deterministicProvider;
    }

    public AIResult routeAndExecute(String userPrompt, AnalysisHistoryEntity context, String language) {
        if (externalLLMProvider.isAvailable()) {
            try {
                log.info("Attempting response generation via External LLM Provider...");
                return externalLLMProvider.generateResponse(userPrompt, context, language);
            } catch (Exception e) {
                log.warn("External LLM Provider failed ({}); falling back to Deterministic NutriSaathi Engine.", e.getMessage());
                String fallbackText = "NutriVerify AI's generative service is temporarily unavailable. Here is a verified label-based answer:\n\n"
                        + deterministicProvider.generateResponse(userPrompt, context, language).getContent();
                return AIResult.verifiedFallback(fallbackText);
            }
        }

        log.debug("External LLM Provider unconfigured; using Deterministic NutriSaathi Engine.");
        return deterministicProvider.generateResponse(userPrompt, context, language);
    }

    public boolean isExternalAIAvailable() {
        return externalLLMProvider.isAvailable();
    }
}
