package com.nutriverify.engine;

import com.nutriverify.model.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class IngredientAnalyzerTest {

    private final IngredientAnalyzer analyzer = new IngredientAnalyzer();

    @Test
    public void testAllNaturalIngredients() {
        FoodLabel label = new FoodLabel("Fruit Bar", "Nature", "40g",
            List.of(
                new Ingredient("Apples", IngredientCategory.NATURAL, ""),
                new Ingredient("Bananas", IngredientCategory.NATURAL, ""),
                new Ingredient("Dates", IngredientCategory.NATURAL, "")
            ),
            List.of(), 150, 2, 18, 10, 3, 32, 5);
        List<IngredientRisk> risks = analyzer.analyze(label);
        assertTrue(risks.isEmpty(), "All-natural ingredients should produce no risks");
    }

    @Test
    public void testArtificialIngredientsDetected() {
        FoodLabel label = new FoodLabel("Candy", "SweetCo", "30g",
            List.of(
                new Ingredient("Sugar", IngredientCategory.SWEETENER, ""),
                new Ingredient("Red 40", IngredientCategory.ARTIFICIAL, ""),
                new Ingredient("Aspartame", IngredientCategory.SWEETENER, ""),
                new Ingredient("Water", IngredientCategory.NATURAL, "")
            ),
            List.of(), 120, 0, 30, 5, 0, 30, 0);
        List<IngredientRisk> risks = analyzer.analyze(label);
        assertFalse(risks.isEmpty(), "Non-natural ingredients should be flagged");
        boolean hasArtificial = risks.stream().anyMatch(r -> r.getCategory() == IngredientCategory.ARTIFICIAL);
        boolean hasSweetener = risks.stream().anyMatch(r -> r.getCategory() == IngredientCategory.SWEETENER);
        assertTrue(hasArtificial, "Should detect artificial ingredients");
        assertTrue(hasSweetener, "Should detect sweetener ingredients");
    }

    @Test
    public void testPreservativeDetected() {
        FoodLabel label = new FoodLabel("Juice", "DrinkCo", "250ml",
            List.of(
                new Ingredient("Water", IngredientCategory.NATURAL, ""),
                new Ingredient("Citric Acid", IngredientCategory.PRESERVATIVE, "")
            ),
            List.of(), 100, 0, 22, 15, 0, 26, 0);
        List<IngredientRisk> risks = analyzer.analyze(label);
        boolean hasPreservative = risks.stream().anyMatch(r -> r.getCategory() == IngredientCategory.PRESERVATIVE);
        assertTrue(hasPreservative, "Should detect preservative");
    }

    @Test
    public void testCountMatches() {
        FoodLabel label = new FoodLabel("Processed", "Co", "100g",
            List.of(
                new Ingredient("Sugar A", IngredientCategory.SWEETENER, ""),
                new Ingredient("Sugar B", IngredientCategory.SWEETENER, ""),
                new Ingredient("Color 1", IngredientCategory.ARTIFICIAL, ""),
                new Ingredient("Color 2", IngredientCategory.ARTIFICIAL, ""),
                new Ingredient("Color 3", IngredientCategory.ARTIFICIAL, "")
            ),
            List.of(), 200, 5, 30, 100, 2, 40, 0);
        List<IngredientRisk> risks = analyzer.analyze(label);
        IngredientRisk sweetenerRisk = risks.stream()
            .filter(r -> r.getCategory() == IngredientCategory.SWEETENER).findFirst().orElse(null);
        IngredientRisk artificialRisk = risks.stream()
            .filter(r -> r.getCategory() == IngredientCategory.ARTIFICIAL).findFirst().orElse(null);
        assertNotNull(sweetenerRisk);
        assertNotNull(artificialRisk);
        assertEquals(2, sweetenerRisk.getCount());
        assertEquals(3, artificialRisk.getCount());
    }

    @Test
    public void testEmptyIngredients() {
        FoodLabel label = new FoodLabel("Water", "Aqua", "500ml",
            List.of(), List.of(), 0, 0, 0, 5, 0, 0, 0);
        List<IngredientRisk> risks = analyzer.analyze(label);
        assertTrue(risks.isEmpty());
    }
}
