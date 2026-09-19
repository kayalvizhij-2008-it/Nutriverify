package com.nutriverify.engine;

import com.nutriverify.engine.rules.*;
import com.nutriverify.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ClaimValidatorTest {

    private ClaimValidator validator;

    @BeforeEach
    public void setUp() {
        validator = new ClaimValidator(List.of(
            new NoAddedSugarRule(),
            new LowFatRule(),
            new HighProteinRule(),
            new NaturalRule(),
            new OrganicRule(),
            new NonGmoRule()
        ));
    }

    @Test
    public void testHighProteinVerified() {
        FoodLabel label = new FoodLabel("Protein Bar", "FitBrand", "60g",
            List.of(new Ingredient("Whey Protein", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.HIGH_PROTEIN, "High Protein")),
            200, 5, 3, 150, 20, 15, 2);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
    }

    @Test
    public void testHighProteinNotSupported() {
        FoodLabel label = new FoodLabel("Soda", "FizzBrand", "330ml",
            List.of(new Ingredient("Water", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.HIGH_PROTEIN, "High Protein")),
            140, 0, 35, 10, 0.5, 35, 0);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.FALSE, results.get(0).getVerdict());
    }

    @Test
    public void testLowFatVerified() {
        FoodLabel label = new FoodLabel("Rice Cake", "HealthyBrand", "25g",
            List.of(new Ingredient("Brown Rice", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.LOW_FAT, "Low Fat")),
            110, 1, 0.5, 50, 2, 23, 1);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
    }

    @Test
    public void testLowFatNotSupported() {
        FoodLabel label = new FoodLabel("Chips", "CrunchBrand", "50g",
            List.of(new Ingredient("Oil", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.LOW_FAT, "Low Fat")),
            270, 18, 1, 300, 3, 28, 1);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.FALSE, results.get(0).getVerdict());
    }

    @Test
    public void testNoAddedSugarVerified() {
        FoodLabel label = new FoodLabel("Fruit Bar", "NatureBrand", "40g",
            List.of(new Ingredient("Dates", IngredientCategory.NATURAL, ""),
                     new Ingredient("Almonds", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.NO_ADDED_SUGAR, "No Added Sugar")),
            150, 4, 12, 20, 5, 25, 3);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
    }

    @Test
    public void testNoAddedSugarNotSupported() {
        FoodLabel label = new FoodLabel("Yogurt", "SweetBrand", "200g",
            List.of(new Ingredient("Milk", IngredientCategory.ALLERGEN, ""),
                     new Ingredient("Sugar", IngredientCategory.SWEETENER, "")),
            List.of(new Claim(ClaimType.NO_ADDED_SUGAR, "No Added Sugar")),
            180, 5, 20, 80, 6, 25, 0);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.FALSE, results.get(0).getVerdict());
    }

    @Test
    public void testNaturalVerified() {
        FoodLabel label = new FoodLabel("Apple Sauce", "FarmBrand", "100g",
            List.of(new Ingredient("Apples", IngredientCategory.NATURAL, ""),
                     new Ingredient("Water", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.NATURAL, "All Natural")),
            80, 0, 14, 10, 0, 21, 2);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
    }

    @Test
    public void testNaturalNotSupported() {
        FoodLabel label = new FoodLabel("Candy", "SweetBrand", "40g",
            List.of(new Ingredient("Sugar", IngredientCategory.SWEETENER, ""),
                     new Ingredient("Red Dye 40", IngredientCategory.ARTIFICIAL, "")),
            List.of(new Claim(ClaimType.NATURAL, "All Natural")),
            160, 0, 38, 5, 0, 40, 0);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(1, results.size());
        assertEquals(ClaimVerdict.FALSE, results.get(0).getVerdict());
    }

    @Test
    public void testMultipleClaims() {
        FoodLabel label = new FoodLabel("Protein Bar", "FitBrand", "60g",
            List.of(new Ingredient("Whey Protein", IngredientCategory.NATURAL, ""),
                     new Ingredient("Oats", IngredientCategory.NATURAL, "")),
            List.of(
                new Claim(ClaimType.HIGH_PROTEIN, "High Protein"),
                new Claim(ClaimType.LOW_FAT, "Low Fat")
            ),
            200, 2.5, 3, 100, 20, 20, 3);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(2, results.size());
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
        assertEquals(ClaimVerdict.VERIFIED, results.get(1).getVerdict());
    }

    @Test
    public void testNoClaimsReturnsEmpty() {
        FoodLabel label = new FoodLabel("Plain Water", "AquaBrand", "500ml",
            List.of(), List.of(),
            0, 0, 0, 10, 0, 0, 0);
        List<ClaimResult> results = validator.validate(label);
        assertTrue(results.isEmpty());
    }

    @Test
    public void testOrganicVerified() {
        FoodLabel label = new FoodLabel("Organic Oats", "NatureBrand", "40g",
            List.of(new Ingredient("Organic Oats", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.ORGANIC, "USDA Organic")),
            150, 3, 1, 0, 5, 27, 4);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
    }

    @Test
    public void testNonGmoVerified() {
        FoodLabel label = new FoodLabel("Apple Juice", "NatureBrand", "250ml",
            List.of(new Ingredient("Apple Juice", IngredientCategory.NATURAL, "")),
            List.of(new Claim(ClaimType.NON_GMO, "Non-GMO Verified")),
            110, 0, 24, 5, 0, 28, 0);
        List<ClaimResult> results = validator.validate(label);
        assertEquals(ClaimVerdict.VERIFIED, results.get(0).getVerdict());
    }
}
