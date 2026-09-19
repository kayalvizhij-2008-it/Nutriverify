package com.nutriverify.engine;

import com.nutriverify.model.*;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ComparisonEngineTest {

    private final ComparisonEngine engine = new ComparisonEngine();

    private AnalysisResult makeResult(String name, int authenticity, int health, double sugar, double sodium) {
        FoodLabel label = new FoodLabel(name, "Brand", "100g",
            Collections.emptyList(), Collections.emptyList(),
            200, 5, sugar, sodium, 10, 30, 3);
        return new AnalysisResult(label, Collections.emptyList(), Collections.emptyList(),
            Collections.emptyList(), Collections.emptyList(), authenticity, health, RiskLevel.LOW_RISK);
    }

    @Test
    public void testFirstProductBetter() {
        AnalysisResult a = makeResult("Healthy Bar", 90, 85, 3, 100);
        AnalysisResult b = makeResult("Sugary Bar", 50, 40, 25, 500);
        String result = engine.compare(a, b);
        assertTrue(result.contains("Healthy Bar"));
    }

    @Test
    public void testSecondProductBetter() {
        AnalysisResult a = makeResult("Bad Bar", 40, 30, 30, 600);
        AnalysisResult b = makeResult("Good Bar", 90, 85, 2, 100);
        String result = engine.compare(a, b);
        assertTrue(result.contains("Good Bar"));
    }

    @Test
    public void testTie() {
        AnalysisResult a = makeResult("Bar A", 75, 70, 10, 200);
        AnalysisResult b = makeResult("Bar B", 75, 70, 10, 200);
        String result = engine.compare(a, b);
        assertTrue(result.toLowerCase().contains("tie") || result.contains("identical"));
    }

    @Test
    public void testDifferencesList() {
        AnalysisResult a = makeResult("Product A", 80, 75, 5, 150);
        AnalysisResult b = makeResult("Product B", 60, 50, 15, 400);
        List<String> diffs = engine.differences(a, b);
        assertFalse(diffs.isEmpty());
        assertTrue(diffs.size() >= 5, "Should have at least 5 difference metrics");
    }
}
