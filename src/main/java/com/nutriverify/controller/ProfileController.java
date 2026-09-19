package com.nutriverify.controller;

import com.nutriverify.data.UserRepository;
import com.nutriverify.entity.UserEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller for user profile management.
 */
@RestController
@RequestMapping("/api/v1")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        UserEntity user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("fullName", user.getFullName());
        profile.put("totalScansPerformed", user.getTotalScansPerformed());
        profile.put("dietaryGoals", user.getDietaryGoals());
        profile.put("allergens", user.getAllergens());
        profile.put("preferredLanguage", user.getPreferredLanguage());
        profile.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {

        UserEntity user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        if (updates.containsKey("fullName")) user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("dietaryGoals")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> goals = (java.util.List<String>) updates.get("dietaryGoals");
            user.setDietaryGoals(goals != null ? goals : new java.util.ArrayList<>());
        }
        if (updates.containsKey("allergens")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> allergens = (java.util.List<String>) updates.get("allergens");
            user.setAllergens(allergens != null ? allergens : new java.util.ArrayList<>());
        }
        if (updates.containsKey("preferredLanguage")) user.setPreferredLanguage((String) updates.get("preferredLanguage"));

        userRepository.save(user);

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("fullName", user.getFullName());
        profile.put("totalScansPerformed", user.getTotalScansPerformed());
        profile.put("dietaryGoals", user.getDietaryGoals());
        profile.put("allergens", user.getAllergens());
        profile.put("preferredLanguage", user.getPreferredLanguage());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/goals")
    public ResponseEntity<Map<String, Object>> getGoals(Authentication authentication) {
        UserEntity user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        Map<String, Object> goals = new LinkedHashMap<>();
        goals.put("dietaryGoals", user.getDietaryGoals());
        return ResponseEntity.ok(goals);
    }

    @PutMapping("/goals")
    public ResponseEntity<Map<String, Object>> updateGoals(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        UserEntity user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (updates.containsKey("dietaryGoals")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> goals = (java.util.List<String>) updates.get("dietaryGoals");
            user.setDietaryGoals(goals != null ? goals : new java.util.ArrayList<>());
        }
        userRepository.save(user);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("dietaryGoals", user.getDietaryGoals());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products")
    public ResponseEntity<java.util.List<Map<String, Object>>> getProducts(Authentication authentication) {
        // Product catalog (currently just analysis history products)
        return ResponseEntity.ok(java.util.List.of());
    }
}
