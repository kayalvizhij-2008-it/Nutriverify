package com.nutriverify.controller;

import com.nutriverify.data.AnalysisHistoryRepository;
import com.nutriverify.data.UserRepository;
import com.nutriverify.dto.AnalysisResponse;
import com.nutriverify.dto.CompareRequest;
import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.entity.UserEntity;
import com.nutriverify.service.WebAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for product comparison.
 */
@RestController
@RequestMapping("/api/v1/compare")
public class CompareController {

    private final WebAnalysisService analysisService;
    private final AnalysisHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public CompareController(WebAnalysisService analysisService,
                             AnalysisHistoryRepository historyRepository,
                             UserRepository userRepository) {
        this.analysisService = analysisService;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> compare(
            @Valid @RequestBody CompareRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        String userId = user != null ? user.getId() : "anonymous";

        AnalysisHistoryEntity a = historyRepository.findById(request.getFirstHistoryId()).orElse(null);
        AnalysisHistoryEntity b = historyRepository.findById(request.getSecondHistoryId()).orElse(null);

        if (a == null || b == null) {
            return ResponseEntity.notFound().build();
        }

        if (!a.getUserId().equals(userId) || !b.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        AnalysisResponse respA = entityToResponse(a);
        AnalysisResponse respB = entityToResponse(b);

        Map<String, Object> result = analysisService.compareAnalyses(respA, respB);
        return ResponseEntity.ok(result);
    }

    private AnalysisResponse entityToResponse(AnalysisHistoryEntity entity) {
        AnalysisResponse response = new AnalysisResponse();
        response.setProductName(entity.getProductName());
        response.setBrand(entity.getBrand());
        response.setServingSize(entity.getServingSize());
        response.setCalories(entity.getCalories());
        response.setFat(entity.getFat());
        response.setSugar(entity.getSugar());
        response.setSodium(entity.getSodium());
        response.setProtein(entity.getProtein());
        response.setCarbs(entity.getCarbs());
        response.setFiber(entity.getFiber());
        response.setAuthenticityScore(entity.getAuthenticityScore());
        response.setHealthScore(entity.getHealthScore());
        response.setRiskLevel(entity.getRiskLevel());
        response.setAnalyzedAt(entity.getAnalyzedAt() != null ? entity.getAnalyzedAt().toString() : null);
        return response;
    }
}
