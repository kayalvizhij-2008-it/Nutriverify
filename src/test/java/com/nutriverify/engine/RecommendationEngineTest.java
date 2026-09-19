package com.nutriverify.engine;

import com.nutriverify.model.*;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RecommendationEngineTest {

    private final RecommendationEngine engine = new RecommendationEngine();

    @Test
    public void testHighScoreRecommendation() {
        FoodLabel label = new FoodLabel("Healthy Food", "Brand", "100g",
            Collections.emptyList(), Collections.emptyList(),
            150, 3, 5, 100, 10, 20, 5);
        List<String> recs = engine.generatePersonalizedRecommendations(label, null, 85);
        assertTrue(recs.stream().anyMatch(r -> r.contains("High nutrient density") || r.contains("daily consumption")));
    }

    @Test
    public void testMediumScoreRecommendation() {
        FoodLabel label = new FoodLabel("Moderate Food", "Brand", "100g",
            Collections.emptyList(), Collections.emptyList(),
            250, 10, 15, 350, 6, 30, 2);
        List<String> recs = engine.generatePersonalizedRecommendations(label, null, 60);
        assertTrue(recs.stream().anyMatch(r -> r.contains("Moderate") || r.contains("moderation")));
    }

    @Test
    public void testLowScoreRecommendation() {
        FoodLabel label = new FoodLabel("Junk Food", "Brand", "100g",
            Collections.emptyList(), Collections.emptyList(),
            400, 20, 30, 800, 2, 45, 0);
        List<String> recs = engine.generatePersonalizedRecommendations(label, null, 30);
        assertTrue(recs.stream().anyMatch(r -> r.contains("Low nutritional") || r.contains("healthier alternatives")));
    }

    @Test
    public void testLowSugarGoalConflict() {
        FoodLabel label = new FoodLabel("Sweet Cereal", "Brand", "40g",
            Collections.emptyList(), Collections.emptyList(),
            180, 3, 12, 150, 3, 34, 2);
        // Engine checks normalized.contains("low sugar")
        UserProfile profile = new UserProfile("Test", List.of("low sugar"), List.of(), 0);
        List<String> recs = engine.generatePersonalizedRecommendations(label, profile, 55);
        assertTrue(recs.stream().anyMatch(r -> r.toLowerCase().contains("sugar") && r.toLowerCase().contains("goal")));
    }

    @Test
    public void testLowSodiumGoalConflict() {
        FoodLabel label = new FoodLabel("Instant Noodles", "Brand", "80g",
            Collections.emptyList(), Collections.emptyList(),
            380, 14, 2, 600, 8, 52, 2);
        // Engine checks normalized.contains("low sodium")
        UserProfile profile = new UserProfile("Test", List.of("low sodium"), List.of(), 0);
        List<String> recs = engine.generatePersonalizedRecommendations(label, profile, 50);
        assertTrue(recs.stream().anyMatch(r -> r.toLowerCase().contains("sodium") && r.toLowerCase().contains("goal")));
    }

    @Test
    public void testHighProteinGoalConflict() {
        FoodLabel label = new FoodLabel("Rice Cake", "Brand", "25g",
            Collections.emptyList(), Collections.emptyList(),
            80, 0.5, 0, 50, 2, 17, 0.5);
        // Engine checks normalized.contains("high protein")
        UserProfile profile = new UserProfile("Test", List.of("high protein"), List.of(), 0);
        List<String> recs = engine.generatePersonalizedRecommendations(label, profile, 60);
        assertTrue(recs.stream().anyMatch(r -> r.toLowerCase().contains("protein") && r.toLowerCase().contains("goal")));
    }

    @Test
    public void testAllergenWarning() {
        FoodLabel label = new FoodLabel("Granola Bar", "Brand", "40g",
            List.of(new Ingredient("Peanuts", IngredientCategory.ALLERGEN, "")),
            Collections.emptyList(), 200, 8, 8, 100, 6, 25, 3);
        UserProfile profile = new UserProfile("Test", List.of(), List.of("peanuts"), 0);
        List<String> recs = engine.generatePersonalizedRecommendations(label, profile, 70);
        assertTrue(recs.stream().anyMatch(r -> r.toLowerCase().contains("allergen") || r.toLowerCase().contains("peanut")));
    }

    @Test
    public void testNoUserProfileProducesGeneralRecommendations() {
        FoodLabel label = new FoodLabel("Food", "Brand", "100g",
            Collections.emptyList(), Collections.emptyList(),
            200, 5, 10, 200, 8, 28, 3);
        List<String> recs = engine.generatePersonalizedRecommendations(label, null, 65);
        assertFalse(recs.isEmpty());
    }
}
