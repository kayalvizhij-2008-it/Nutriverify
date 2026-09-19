package com.nutriverify.engine;

import com.nutriverify.model.FoodLabel;
import com.nutriverify.model.NutritionConsistencyFinding;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class NutritionConsistencyCheckerTest {

    private NutritionConsistencyChecker checker;

    @BeforeEach
    public void setUp() {
        checker = new NutritionConsistencyChecker();
    }

    @Test
    public void testConsistentLabel() {
        // Fat(5)*9 + Carbs(30)*4 + Protein(10)*4 = 45 + 120 + 40 = 205 kcal
        FoodLabel label = new FoodLabel("Cereal", "Brand", "40g",
            Collections.emptyList(), Collections.emptyList(),
            205, 5, 8, 200, 10, 30, 3);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        // Calories should be consistent (within 15% tolerance)
        boolean calorieProblem = findings.stream()
            .filter(f -> f.isProblematic() && f.getMessage().toLowerCase().contains("calori"))
            .anyMatch(f -> true);
        assertFalse(calorieProblem, "Consistent calories should not be flagged");
    }

    @Test
    public void testInconsistentCalories() {
        // Fat(5)*9 + Carbs(30)*4 + Protein(10)*4 = 205, but label says 400
        FoodLabel label = new FoodLabel("Fake Cereal", "Brand", "40g",
            Collections.emptyList(), Collections.emptyList(),
            400, 5, 8, 200, 10, 30, 3);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        boolean calorieProblem = findings.stream()
            .anyMatch(f -> f.isProblematic() && f.getMessage().toLowerCase().contains("calori"));
        assertTrue(calorieProblem, "Inconsistent calories should be flagged");
    }

    @Test
    public void testSugarExceedsCarbs() {
        FoodLabel label = new FoodLabel("Weird Product", "Brand", "30g",
            Collections.emptyList(), Collections.emptyList(),
            120, 3, 40, 100, 2, 30, 0);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        boolean sugarProblem = findings.stream()
            .anyMatch(f -> f.isProblematic() && f.getMessage().toLowerCase().contains("sugar"));
        assertTrue(sugarProblem, "Sugar > carbs should be flagged");
    }

    @Test
    public void testHighSodium() {
        FoodLabel label = new FoodLabel("Instant Noodles", "Brand", "80g",
            Collections.emptyList(), Collections.emptyList(),
            380, 14, 2, 800, 8, 52, 2);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        boolean sodiumProblem = findings.stream()
            .anyMatch(f -> f.isProblematic() && f.getMessage().toLowerCase().contains("sodium"));
        assertTrue(sodiumProblem, "High sodium should be flagged");
    }

    @Test
    public void testLowSodium() {
        FoodLabel label = new FoodLabel("Fresh Salad", "Brand", "100g",
            Collections.emptyList(), Collections.emptyList(),
            45, 2, 2, 50, 3, 6, 3);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        boolean sodiumProblem = findings.stream()
            .anyMatch(f -> f.isProblematic() && f.getMessage().toLowerCase().contains("sodium"));
        assertFalse(sodiumProblem, "Low sodium should not be flagged");
    }

    @Test
    public void testFindingsAreNotProblematicWhenGood() {
        // Fat(3)*9 + Carbs(20)*4 + Protein(8)*4 = 27+80+32 = 139
        // Label says 140, delta = |139-140|/140 = 0.007 < 0.15 → consistent
        // Sugar(5) < Carbs(20) → consistent
        // Sodium(150) < 400 → consistent
        FoodLabel label = new FoodLabel("Good Food", "Brand", "50g",
            Collections.emptyList(), Collections.emptyList(),
            140, 3, 5, 150, 8, 20, 4);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        long problematic = findings.stream().filter(NutritionConsistencyFinding::isProblematic).count();
        assertEquals(0, problematic, "All checks should pass for a well-formed label");
    }

    @Test
    public void testMultipleIssuesDetected() {
        // Inconsistent calories AND sugar > carbs AND high sodium
        // Fat(10)*9 + Carbs(5)*4 + Protein(2)*4 = 90+20+8 = 118, but label says 400
        // Sugar(50) > Carbs(5)
        // Sodium(600) > 400
        FoodLabel label = new FoodLabel("Bad Product", "Brand", "30g",
            Collections.emptyList(), Collections.emptyList(),
            400, 10, 50, 600, 2, 5, 0);
        List<NutritionConsistencyFinding> findings = checker.check(label);
        long problematic = findings.stream().filter(NutritionConsistencyFinding::isProblematic).count();
        assertTrue(problematic >= 2, "Should detect multiple issues");
    }
}
