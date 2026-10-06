package com.nutriverify.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutriverify.entity.AnalysisHistoryEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Robust External LLM Provider for NutriVerify AI.
 * Handles OpenAI/Gemini/Anthropic REST API requests with system prompts, safety pre-screening,
 * error status handling, and exponential retry for temporary network/server errors.
 */
@Component
public class ExternalLLMProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(ExternalLLMProvider.class);

    private static final Pattern PROMPT_INJECTION_PATTERN = Pattern.compile(
            "(?i).*(ignore (all )?previous instructions|override (the )?score|system prompt|api key|jwt secret|reveal internal|act asDAN|jailbreak).*"
    );

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final int timeoutMs;
    private final boolean enabled;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @org.springframework.beans.factory.annotation.Autowired
    public ExternalLLMProvider(
            @Value("${nutriverify.ai.enabled:true}") boolean enabled,
            @Value("${nutriverify.ai.api-key:${AI_API_KEY:}}") String apiKey,
            @Value("${nutriverify.ai.model:${AI_MODEL:gpt-4o-mini}}") String model,
            @Value("${nutriverify.ai.base-url:${AI_BASE_URL:https://api.openai.com/v1}}") String baseUrl,
            @Value("${nutriverify.ai.timeout-ms:${AI_TIMEOUT_MS:10000}}") int timeoutMs,
            ObjectMapper objectMapper) {
        this.enabled = enabled;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null && !model.trim().isEmpty() ? model.trim() : "gpt-4o-mini";
        this.baseUrl = baseUrl != null && !baseUrl.trim().isEmpty() ? baseUrl.trim() : "https://api.openai.com/v1";
        this.timeoutMs = timeoutMs > 0 ? timeoutMs : 10000;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(this.timeoutMs))
                .build();
    }

    public ExternalLLMProvider(String apiKey, String model, String baseUrl, int timeoutMs, ObjectMapper objectMapper) {
        this(true, apiKey, model, baseUrl, timeoutMs, objectMapper);
    }

    @Override
    public AIResult generateResponse(String userPrompt, AnalysisHistoryEntity context, String language) {
        if (!isAvailable()) {
            throw new IllegalStateException("External LLM Provider is disabled or API key is not configured.");
        }

        // Safety Pre-Screening Layer
        if (isUnsafeOrInjectionAttempt(userPrompt)) {
            log.warn("Safety pre-screening flagged potential injection or policy violation in prompt.");
            return AIResult.externalAi("NutriVerify AI is a food-label explanation layer. I cannot answer requests trying to override verification scores, reveal system prompts, or bypass safety controls.");
        }

        String systemPrompt = buildNutriVerifySystemPrompt(language);
        String userContent = buildContextualUserMessage(userPrompt, context);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userContent));

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.2);
        requestBody.put("max_tokens", 800);

        try {
            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            String endpoint = baseUrl.endsWith("/") ? baseUrl + "chat/completions" : baseUrl + "/chat/completions";

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            log.info("Executing NutriVerify AI call to endpoint: {}, model: {}", endpoint, model);

            // Execute request with retry policy for 502/503/timeout
            HttpResponse<String> httpResponse = executeWithRetry(httpRequest);

            int status = httpResponse.statusCode();
            if (status != 200) {
                log.warn("External LLM API returned non-200 HTTP status code: {}", status);
                throw new RuntimeException("External LLM API returned HTTP status " + status);
            }

            JsonNode rootNode = objectMapper.readTree(httpResponse.body());
            JsonNode choices = rootNode.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                String aiText = choices.get(0).path("message").path("content").asText();
                if (aiText != null && !aiText.trim().isEmpty()) {
                    return AIResult.externalAi(aiText.trim());
                }
            }

            throw new RuntimeException("Empty response payload received from External LLM");

        } catch (Exception e) {
            log.warn("External LLM Provider execution failed: {}", e.getMessage());
            throw new RuntimeException("External LLM execution error: " + e.getMessage(), e);
        }
    }

    private HttpResponse<String> executeWithRetry(HttpRequest request) throws Exception {
        int maxAttempts = 2;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int status = response.statusCode();

                // Non-retriable auth or client errors (400, 401, 403, 404)
                if (status == 400 || status == 401 || status == 403 || status == 404) {
                    return response;
                }

                // Retriable server errors (502, 503, 408) on first attempt
                if ((status == 502 || status == 503 || status == 408) && attempt < maxAttempts) {
                    log.warn("Retriable HTTP {} on attempt {}, retrying in 200ms...", status, attempt);
                    Thread.sleep(200);
                    continue;
                }

                return response;
            } catch (Exception e) {
                lastException = e;
                if (attempt < maxAttempts) {
                    log.warn("Network timeout/error on attempt {}, retrying in 200ms...", attempt);
                    Thread.sleep(200);
                }
            }
        }

        throw lastException != null ? lastException : new RuntimeException("HTTP request retry exhausted");
    }

    private boolean isUnsafeOrInjectionAttempt(String prompt) {
        if (prompt == null) return false;
        return PROMPT_INJECTION_PATTERN.matcher(prompt).matches();
    }

    @Override
    public boolean isAvailable() {
        return enabled && !apiKey.isEmpty() && !apiKey.equalsIgnoreCase("unset");
    }

    @Override
    public String getProviderName() {
        return "ExternalLLMProvider (" + model + ")";
    }

    private String buildNutriVerifySystemPrompt(String language) {
        String langInstruction = switch (language != null ? language.toLowerCase() : "en") {
            case "hi" -> "Respond in natural Hindi (हिंदी). Maintain numerical figures and metrics accurately.";
            case "ta" -> "Respond in natural Tamil (தமிழ்). Maintain numerical figures and metrics accurately.";
            default -> "Respond in clear, accessible English.";
        };

        return """
                You are NutriVerify AI, an official AI explanation layer for NutriVerify's verified food-label analysis platform.
                Your sole purpose is to explain food labels, nutritional density, ingredient concerns, allergen alerts, statutory claim verifications, and health scores using the verified context.
                
                MANDATORY ACCURACY & GROUNDING RULES:
                1. Base your explanations ONLY on the provided verified product analysis context.
                2. NEVER invent, fabricate, or alter numerical nutrition values, ingredient risks, or verification scores.
                3. If specific nutritional information or ingredient details are absent in the context, state explicitly: "NutriVerify does not have enough verified data to determine that."
                4. Do NOT diagnose medical conditions or prescribe medical diets.
                5. Structure explanations clearly using short paragraphs and bullet points.
                6. %s
                """.formatted(langInstruction);
    }

    private String buildContextualUserMessage(String prompt, AnalysisHistoryEntity ctx) {
        StringBuilder sb = new StringBuilder();
        if (ctx != null) {
            sb.append("=== VERIFIED NUTRIVERIFY ANALYSIS DOSSIER ===\n");
            sb.append("Product Name: ").append(ctx.getProductName()).append("\n");
            sb.append("Brand: ").append(ctx.getBrand() != null ? ctx.getBrand() : "N/A").append("\n");
            sb.append("Serving Size: ").append(ctx.getServingSize() != null ? ctx.getServingSize() : "N/A").append("\n");
            sb.append("Calories: ").append(ctx.getCalories()).append(" kcal\n");
            sb.append("Sugar: ").append(ctx.getSugar()).append(" g\n");
            sb.append("Sodium: ").append(ctx.getSodium()).append(" mg\n");
            sb.append("Protein: ").append(ctx.getProtein()).append(" g\n");
            sb.append("Fat: ").append(ctx.getFat()).append(" g\n");
            sb.append("Carbohydrates: ").append(ctx.getCarbs()).append(" g\n");
            sb.append("Fiber: ").append(ctx.getFiber()).append(" g\n");
            sb.append("Health Score: ").append(ctx.getHealthScore()).append(" / 100\n");
            sb.append("Authenticity Score: ").append(ctx.getAuthenticityScore()).append(" / 100\n");
            sb.append("Risk Level: ").append(ctx.getRiskLevel()).append("\n");
            if (ctx.getClaimResults() != null) sb.append("Claims Verified: ").append(ctx.getClaimResults()).append("\n");
            if (ctx.getIngredientRisks() != null) sb.append("Ingredient Risks: ").append(ctx.getIngredientRisks()).append("\n");
            if (ctx.getNutritionFindings() != null) sb.append("Nutrition Findings: ").append(ctx.getNutritionFindings()).append("\n");
            if (ctx.getRecommendations() != null) sb.append("Recommendations: ").append(ctx.getRecommendations()).append("\n");
            sb.append("=============================================\n\n");
        } else {
            sb.append("[No specific product context selected]\n\n");
        }

        sb.append("User Question: ").append(prompt);
        return sb.toString();
    }
}
