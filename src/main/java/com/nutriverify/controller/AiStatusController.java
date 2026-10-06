package com.nutriverify.controller;

import com.nutriverify.service.ai.AIProviderRouter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller for NutriVerify AI and feature status monitoring.
 */
@RestController
@RequestMapping("/api/v1/ai")
public class AiStatusController {

    private final AIProviderRouter router;
    private final com.nutriverify.service.ocr.OCRProviderRouter ocrRouter;
    private final boolean speechConfigured;
    private final String providerName;

    public AiStatusController(
            AIProviderRouter router,
            com.nutriverify.service.ocr.OCRProviderRouter ocrRouter,
            @Value("${nutriverify.speech.api-key:}") String speechKey,
            @Value("${nutriverify.ai.provider:openai}") String providerName) {
        this.router = router;
        this.ocrRouter = ocrRouter;
        this.speechConfigured = speechKey != null && !speechKey.trim().isEmpty() && !speechKey.equalsIgnoreCase("unset");
        this.providerName = providerName;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        boolean isExternalAvailable = router.isExternalAIAvailable();

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("aiConfigured", isExternalAvailable);
        status.put("aiAvailable", isExternalAvailable);
        status.put("provider", providerName);
        status.put("mode", isExternalAvailable ? "external" : "fallback");
        status.put("statusLabel", isExternalAvailable ? "AI-powered" : "Verified fallback");
        status.put("ocrConfigured", ocrRouter.isOcrConfigured());
        status.put("speechConfigured", speechConfigured);
        return ResponseEntity.ok(status);
    }
}
