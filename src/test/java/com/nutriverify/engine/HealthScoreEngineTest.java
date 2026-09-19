package com.nutriverify.engine;

import com.nutriverify.model.FoodLabel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HealthScoreEngineTest {

    private HealthScoreEngine engine;

    @BeforeEach
    public void setUp() {
        engine = new HealthScoreEngine();
    }

    @Test
    public void testHealthyProductScore() {
        FoodLabel healthyLabel = new FoodLabel(
                "Oatmeal", "HealthBrand", "50g",
                Collections.emptyList(), Collections.emptyList(),
                150.0, 2.0, 1.0, 50.0, 6.0, 27.0, 5.0
        );

        int score = engine.calculateHealthScore(healthyLabel);
        assertTrue(score >= 80, "Healthy product should score 80 or above");
    }

    @Test
    public void testHighSugarPenalty() {
        FoodLabel sugaryLabel = new FoodLabel(
                "Soda", "FizzBrand", "330ml",
                Collections.emptyList(), Collections.emptyList(),
                140.0, 0.0, 35.0, 10.0, 0.0, 35.0, 0.0
        );

        int score = engine.calculateHealthScore(sugaryLabel);
        assertTrue(score < 50, "High sugar product should receive a low health score");
    }
}
