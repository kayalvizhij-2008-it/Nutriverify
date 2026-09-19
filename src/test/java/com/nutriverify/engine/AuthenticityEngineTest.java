package com.nutriverify.engine;

import com.nutriverify.engine.rules.*;
import com.nutriverify.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AuthenticityEngineTest {

    private AuthenticityEngine engine;

    @BeforeEach
    public void setUp() {
        ClaimValidator claimValidator = new ClaimValidator(List.of(
            new NoAddedSugarRule(), new LowFatRule(), new HighProteinRule(),
            new NaturalRule(), new OrganicRule(), new NonGmoRule()
        ));
        engine = new AuthenticityEngine(claimValidator, new NutritionConsistencyChecker(), new IngredientAnalyzer());
    }

    @Test
    public void testHealthyProductAnalysis() {
        FoodLabel label = new FoodLabel("Oatmeal", "HealthBrand", "50g",
            List.of(new Ingredient("Oats", IngredientCategory.NATURAL, ""),
                    new Ingredient("Blueberries", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.NO_ADDED_SUGAR, "No Added Sugar")),
            150, 2, 1, 50, 6, 27, 5);
        AnalysisResult result = engine.analyze(label);
        assertNotNull(result);
        assertTrue(result.getHealthScore() >= 80, "Healthy product should score >= 80");
        assertTrue(result.getAuthenticityScore() >= 60);
        assertEquals(RiskLevel.TRUSTED, result.getRiskLevel());
    }

    @Test
    public void testUnhealthyProductAnalysis() {
        FoodLabel label = new FoodLabel("Soda", "FizzBrand", "330ml",
            List.of(new Ingredient("Sugar", IngredientCategory.SWEETENER, ""),
                    new Ingredient("High Fructose Corn Syrup", IngredientCategory.SWEETENER, "")),
            List.of(new Claim(ClaimType.NO_ADDED_SUGAR, "No Added Sugar")),
            140, 0, 35, 10, 0, 35, 0);
        AnalysisResult result = engine.analyze(label);
        assertNotNull(result);
        assertTrue(result.getHealthScore() < 60, "Unhealthy product should score < 60");
        assertFalse(result.getRecommendations().isEmpty());
    }

    @Test
    public void testWithUserProfile() {
        FoodLabel label = new FoodLabel("Chips", "CrunchCo", "50g",
            List.of(new Ingredient("Oil", IngredientCategory.NATURAL, ""),
                    new Ingredient("Salt", IngredientCategory.NATURAL, "")),
            List.of(), 270, 18, 1, 500, 3, 28, 1);

        UserProfile profile = new UserProfile("Test User",
            List.of("Lower Sodium"), List.of("Peanuts"), 5);

        AnalysisResult result = engine.analyze(label, profile);
        assertNotNull(result);
        // Should have personalized recommendation about sodium goal conflict
        boolean hasSodiumWarning = result.getRecommendations().stream()
            .anyMatch(r -> r.toLowerCase().contains("sodium"));
        assertTrue(hasSodiumWarning, "Should warn about sodium goal conflict");
    }

    @Test
    public void testAnalysisContainsAllRequiredFields() {
        FoodLabel label = new FoodLabel("Test Food", "Brand", "100g",
            List.of(), List.of(), 200, 5, 10, 200, 8, 30, 2);
        AnalysisResult result = engine.analyze(label);
        assertNotNull(result.getLabel());
        assertNotNull(result.getClaimResults());
        assertNotNull(result.getNutritionFindings());
        assertNotNull(result.getIngredientRisks());
        assertNotNull(result.getRecommendations());
        assertTrue(result.getAuthenticityScore() >= 0 && result.getAuthenticityScore() <= 100);
        assertTrue(result.getHealthScore() >= 0 && result.getHealthScore() <= 100);
        assertNotNull(result.getRiskLevel());
    }

    @Test
    public void testConsistencyCheckIntegrated() {
        // Inconsistent calories: Fat(5)*9 + Carbs(20)*4 + Protein(5)*4 = 45+80+20 = 145, but label says 400
        FoodLabel label = new FoodLabel("Weird Food", "Brand", "100g",
            List.of(), List.of(), 400, 5, 10, 200, 5, 20, 2);
        AnalysisResult result = engine.analyze(label);
        boolean hasConsistencyWarning = result.getRecommendations().stream()
            .anyMatch(r -> r.toLowerCase().contains("calor") || r.toLowerCase().contains("consistency"));
        assertTrue(hasConsistencyWarning, "Should flag calorie inconsistency in recommendations");
    }
}
