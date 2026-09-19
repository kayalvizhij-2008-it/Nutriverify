package com.nutriverify.controller;

import com.nutriverify.data.AnalysisHistoryRepository;
import com.nutriverify.data.UserRepository;
import com.nutriverify.dto.AnalyzeRequest;
import com.nutriverify.dto.AnalysisResponse;
import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.entity.UserEntity;
import com.nutriverify.service.WebAnalysisService;
import com.nutriverify.util.JsonMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Analysis controller for product analysis and uploads.
 */
@RestController
@RequestMapping("/api/v1")
public class AnalysisController {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "pdf"
    );

    private final WebAnalysisService analysisService;
    private final AnalysisHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public AnalysisController(WebAnalysisService analysisService,
                              AnalysisHistoryRepository historyRepository,
                              UserRepository userRepository) {
        this.analysisService = analysisService;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyze(
            @Valid @RequestBody AnalyzeRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        UserEntity user = userRepository.findByUsername(username).orElse(null);

        // Run analysis
        AnalysisResponse response = analysisService.analyze(request, user);

        // Generate insight cards and suggestions
        response.setInsightCards(analysisService.generateInsightCards(response));
        response.setSuggestedQuestions(analysisService.generateSuggestedQuestions(response));

        // Persist to history
        AnalysisHistoryEntity history = new AnalysisHistoryEntity();
        history.setUserId(user != null ? user.getId() : "anonymous");
        history.setProductName(response.getProductName());
        history.setBrand(response.getBrand());
        history.setServingSize(response.getServingSize());
        history.setCalories(response.getCalories());
        history.setFat(response.getFat());
        history.setSugar(response.getSugar());
        history.setSodium(response.getSodium());
        history.setProtein(response.getProtein());
        history.setCarbs(response.getCarbs());
        history.setFiber(response.getFiber());
        history.setAuthenticityScore(response.getAuthenticityScore());
        history.setHealthScore(response.getHealthScore());
        history.setRiskLevel(response.getRiskLevel());
        history.setAnalyzedAt(LocalDateTime.now());
        history.setClaimResults(JsonMapper.toJson(response.getClaimResults()));
        history.setIngredientRisks(JsonMapper.toJson(response.getIngredientRisks()));
        history.setNutritionFindings(JsonMapper.toJson(response.getNutritionFindings()));
        history.setRecommendations(JsonMapper.toJson(response.getRecommendations()));
        history.setIngredients(JsonMapper.toJson(request.getIngredients()));
        history.setClaims(JsonMapper.toJson(request.getClaims()));

        historyRepository.save(history);
        response.setHistoryId(history.getId());

        // Increment user scan count
        if (user != null) {
            user.setTotalScansPerformed(user.getTotalScansPerformed() + 1);
            userRepository.save(user);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "File is empty",
                    "status", "rejected"
            ));
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "File size exceeds the 10MB limit",
                    "status", "rejected"
            ));
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "File type not supported. Please upload JPG, PNG, WEBP, or PDF.",
                    "status", "rejected"
            ));
        }

        // Validate file extension (defense against misnamed files)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = getFileExtension(originalFilename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "File extension not supported",
                        "status", "rejected"
                ));
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "File received: " + sanitizeFilename(file.getOriginalFilename()));
        response.put("status", "received");
        response.put("fileName", sanitizeFilename(file.getOriginalFilename()));
        response.put("contentType", contentType);
        response.put("size", file.getSize());
        response.put("ocrStatus", "manual-entry-required");
        response.put("ocrMessage", "OCR provider not configured. Please enter nutrition information manually.");

        return ResponseEntity.ok(response);
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot + 1) : "";
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "unknown";
        // Remove path traversal attempts and dangerous characters
        return filename.replaceAll("[^a-zA-Z0-9._\\-]", "_").replaceAll("\\.{2,}", ".");
    }
}
