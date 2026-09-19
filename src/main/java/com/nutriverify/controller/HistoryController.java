package com.nutriverify.controller;

import com.nutriverify.data.AnalysisHistoryRepository;
import com.nutriverify.data.UserRepository;
import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.entity.UserEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for analysis history.
 */
@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {

    private final AnalysisHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public HistoryController(AnalysisHistoryRepository historyRepository, UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getHistory(Authentication authentication) {
        String username = authentication.getName();
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        String userId = user != null ? user.getId() : "anonymous";

        List<AnalysisHistoryEntity> entries = historyRepository.findByUserIdOrderByAnalyzedAtDesc(userId);
        List<Map<String, Object>> result = entries.stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getHistoryEntry(@PathVariable Long id, Authentication authentication) {
        return historyRepository.findById(id)
                .filter(entry -> {
                    String username = authentication.getName();
                    UserEntity user = userRepository.findByUsername(username).orElse(null);
                    return user != null && user.getId().equals(entry.getUserId());
                })
                .map(this::toMap)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoryEntry(@PathVariable Long id, Authentication authentication) {
        return historyRepository.findById(id)
                .filter(entry -> {
                    String username = authentication.getName();
                    UserEntity user = userRepository.findByUsername(username).orElse(null);
                    return user != null && user.getId().equals(entry.getUserId());
                })
                .map(entry -> {
                    historyRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(AnalysisHistoryEntity entity) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", entity.getId());
        map.put("productName", entity.getProductName());
        map.put("brand", entity.getBrand());
        map.put("servingSize", entity.getServingSize());
        map.put("calories", entity.getCalories());
        map.put("fat", entity.getFat());
        map.put("sugar", entity.getSugar());
        map.put("sodium", entity.getSodium());
        map.put("protein", entity.getProtein());
        map.put("carbs", entity.getCarbs());
        map.put("fiber", entity.getFiber());
        map.put("authenticityScore", entity.getAuthenticityScore());
        map.put("healthScore", entity.getHealthScore());
        map.put("riskLevel", entity.getRiskLevel());
        map.put("claimResults", entity.getClaimResults());
        map.put("ingredientRisks", entity.getIngredientRisks());
        map.put("nutritionFindings", entity.getNutritionFindings());
        map.put("recommendations", entity.getRecommendations());
        map.put("ingredients", entity.getIngredients());
        map.put("claims", entity.getClaims());
        map.put("analyzedAt", entity.getAnalyzedAt() != null ? entity.getAnalyzedAt().toString() : null);
        return map;
    }
}
