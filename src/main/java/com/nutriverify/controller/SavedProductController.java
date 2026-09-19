package com.nutriverify.controller;

import com.nutriverify.data.SavedProductRepository;
import com.nutriverify.data.UserRepository;
import com.nutriverify.dto.AnalysisResponse;
import com.nutriverify.entity.SavedProductEntity;
import com.nutriverify.entity.UserEntity;
import com.nutriverify.util.JsonMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for saved/bookmarked products.
 */
@RestController
@RequestMapping("/api/v1/saved")
public class SavedProductController {

    private final SavedProductRepository savedProductRepository;
    private final UserRepository userRepository;

    public SavedProductController(SavedProductRepository savedProductRepository, UserRepository userRepository) {
        this.savedProductRepository = savedProductRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSavedProducts(Authentication authentication) {
        String username = authentication.getName();
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        String userId = user != null ? user.getId() : "anonymous";

        List<SavedProductEntity> products = savedProductRepository.findByUserIdOrderBySavedAtDesc(userId);
        List<Map<String, Object>> result = products.stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveProduct(
            @RequestBody AnalysisResponse analysisResponse,
            Authentication authentication) {

        String username = authentication.getName();
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        String userId = user != null ? user.getId() : "anonymous";

        SavedProductEntity entity = new SavedProductEntity();
        entity.setUserId(userId);
        entity.setProductName(analysisResponse.getProductName());
        entity.setBrand(analysisResponse.getBrand());
        entity.setServingSize(analysisResponse.getServingSize());
        entity.setCalories(analysisResponse.getCalories());
        entity.setFat(analysisResponse.getFat());
        entity.setSugar(analysisResponse.getSugar());
        entity.setSodium(analysisResponse.getSodium());
        entity.setProtein(analysisResponse.getProtein());
        entity.setCarbs(analysisResponse.getCarbs());
        entity.setFiber(analysisResponse.getFiber());
        entity.setAuthenticityScore(analysisResponse.getAuthenticityScore());
        entity.setHealthScore(analysisResponse.getHealthScore());
        entity.setRiskLevel(analysisResponse.getRiskLevel());
        entity.setClaimResults(JsonMapper.toJson(analysisResponse.getClaimResults()));
        entity.setIngredientRisks(JsonMapper.toJson(analysisResponse.getIngredientRisks()));
        entity.setNutritionFindings(JsonMapper.toJson(analysisResponse.getNutritionFindings()));
        entity.setRecommendations(JsonMapper.toJson(analysisResponse.getRecommendations()));
        entity.setSavedAt(LocalDateTime.now());
        entity.setAnalyzedAt(LocalDateTime.now());

        savedProductRepository.save(entity);

        Map<String, Object> response = toMap(entity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavedProduct(@PathVariable Long id, Authentication authentication) {
        return savedProductRepository.findById(id)
                .filter(entity -> {
                    String username = authentication.getName();
                    UserEntity user = userRepository.findByUsername(username).orElse(null);
                    return user != null && user.getId().equals(entity.getUserId());
                })
                .map(entity -> {
                    savedProductRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(SavedProductEntity entity) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", entity.getId());
        map.put("productName", entity.getProductName());
        map.put("brand", entity.getBrand());
        map.put("healthScore", entity.getHealthScore());
        map.put("authenticityScore", entity.getAuthenticityScore());
        map.put("riskLevel", entity.getRiskLevel());
        map.put("savedAt", entity.getSavedAt() != null ? entity.getSavedAt().toString() : null);
        return map;
    }
}
