package com.nutriverify.engine;

import com.nutriverify.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AllergenDetectorTest {

    private AllergenDetector detector;

    @BeforeEach
    public void setUp() {
        detector = new AllergenDetector();
    }

    @Test
    public void testNoAllergensInCleanProduct() {
        FoodLabel label = new FoodLabel("Pure Olive Oil", "Nature", "500ml",
            List.of(new Ingredient("Extra Virgin Olive Oil", IngredientCategory.NATURAL, "")),
            List.of(), 884, 100, 0, 2, 0, 0, 0);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertTrue(findings.isEmpty(), "Olive oil should not contain common allergens");
    }

    @Test
    public void testMilkDetected() {
        FoodLabel label = new FoodLabel("Chocolate Bar", "Brand", "100g",
            List.of(
                new Ingredient("Sugar", IngredientCategory.SWEETENER, ""),
                new Ingredient("Milk Powder", IngredientCategory.ALLERGEN, ""),
                new Ingredient("Cocoa Butter", IngredientCategory.NATURAL, "")
            ),
            List.of(), 530, 30, 50, 80, 8, 59, 1);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertFalse(findings.isEmpty(), "Should detect milk allergen");
        boolean hasMilk = findings.stream().anyMatch(f -> f.getAllergenName().equals("Milk"));
        assertTrue(hasMilk, "Should find Milk allergen");
    }

    @Test
    public void testMultipleAllergensDetected() {
        FoodLabel label = new FoodLabel("Cookies", "Brand", "50g",
            List.of(
                new Ingredient("Wheat Flour", IngredientCategory.NATURAL, ""),
                new Ingredient("Butter", IngredientCategory.NATURAL, ""),
                new Ingredient("Eggs", IngredientCategory.ALLERGEN, ""),
                new Ingredient("Peanuts", IngredientCategory.ALLERGEN, ""),
                new Ingredient("Soy Lecithin", IngredientCategory.ALLERGEN, "")
            ),
            List.of(), 250, 12, 12, 180, 4, 32, 1);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertTrue(findings.size() >= 3, "Should detect wheat, milk (butter), eggs, peanuts, soy");

        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Wheat")));
        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Eggs")));
        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Peanuts")));
        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Soy")));
    }

    @Test
    public void testSesameDetected() {
        FoodLabel label = new FoodLabel("Hummus", "Brand", "100g",
            List.of(
                new Ingredient("Chickpeas", IngredientCategory.NATURAL, ""),
                new Ingredient("Tahini (Sesame Paste)", IngredientCategory.NATURAL, "")
            ),
            List.of(), 166, 10, 2, 383, 8, 14, 4);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Sesame")),
                "Should detect sesame in tahini");
    }

    @Test
    public void testTreeNutDetected() {
        FoodLabel label = new FoodLabel("Granola", "Brand", "40g",
            List.of(
                new Ingredient("Oats", IngredientCategory.NATURAL, ""),
                new Ingredient("Almonds", IngredientCategory.NATURAL, ""),
                new Ingredient("Walnuts", IngredientCategory.NATURAL, "")
            ),
            List.of(), 200, 9, 6, 0, 6, 25, 3);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Tree Nuts")),
                "Should detect tree nuts");
    }

    @Test
    public void testShellfishDetected() {
        FoodLabel label = new FoodLabel("Pad Thai", "Brand", "300g",
            List.of(
                new Ingredient("Rice Noodles", IngredientCategory.NATURAL, ""),
                new Ingredient("Shrimp", IngredientCategory.NATURAL, ""),
                new Ingredient("Peanuts", IngredientCategory.ALLERGEN, "")
            ),
            List.of(), 400, 15, 5, 800, 20, 50, 2);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertTrue(findings.stream().anyMatch(f -> f.getAllergenName().equals("Shellfish")));
    }

    @Test
    public void testEmptyIngredientsNoAllergens() {
        FoodLabel label = new FoodLabel("Water", "Aqua", "500ml",
            List.of(), List.of(), 0, 0, 0, 5, 0, 0, 0);
        List<AllergenDetector.AllergenFinding> findings = detector.detect(label);
        assertTrue(findings.isEmpty());
    }

    @Test
    public void testPersonalAllergenCheck() {
        FoodLabel label = new FoodLabel("Trail Mix", "Brand", "50g",
            List.of(
                new Ingredient("Cashews", IngredientCategory.NATURAL, ""),
                new Ingredient("Raisins", IngredientCategory.NATURAL, ""),
                new Ingredient("Milk Chocolate", IngredientCategory.ALLERGEN, "")
            ),
            List.of(), 250, 15, 15, 50, 6, 28, 2);

        List<AllergenDetector.PersonalAllergenAlert> alerts =
            detector.checkPersonalAllergens(label, List.of("cashew", "milk"));
        assertFalse(alerts.isEmpty(), "Should find personal allergen matches");
        assertTrue(alerts.stream().anyMatch(a -> a.getUserAllergen().equals("cashew") && a.getMatchingIngredient().equals("Cashews")));
        assertTrue(alerts.stream().anyMatch(a -> a.getUserAllergen().equals("milk") && a.getMatchingIngredient().equals("Milk Chocolate")));
    }

    @Test
    public void testPersonalAllergenNoMatch() {
        FoodLabel label = new FoodLabel("Apple Juice", "Brand", "250ml",
            List.of(new Ingredient("Apple Juice Concentrate", IngredientCategory.NATURAL, "")),
            List.of(), 110, 0, 24, 10, 0, 28, 0);
        List<AllergenDetector.PersonalAllergenAlert> alerts =
            detector.checkPersonalAllergens(label, List.of("peanuts", "shellfish"));
        assertTrue(alerts.isEmpty(), "Apple juice should not match peanut/shellfish allergens");
    }

    @Test
    public void testPersonalAllergenEmptyUserAllergens() {
        FoodLabel label = new FoodLabel("Chocolate", "Brand", "100g",
            List.of(new Ingredient("Milk", IngredientCategory.ALLERGEN, "")),
            List.of(), 530, 30, 50, 80, 8, 59, 1);
        List<AllergenDetector.PersonalAllergenAlert> alerts =
            detector.checkPersonalAllergens(label, List.of());
        assertTrue(alerts.isEmpty());
    }
}
