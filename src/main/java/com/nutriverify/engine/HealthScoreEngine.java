package com.nutriverify.engine;

import com.nutriverify.model.FoodLabel;

/**
 * Engine calculating an overall nutritional health score based on macronutrient profile and sodium levels.
 */
public class HealthScoreEngine {

    public int calculateHealthScore(FoodLabel label) {
        double score = 100.0;

        // Sugar penalty: > 10g per serving reduces score
        if (label.getSugar() > 10) {
            score -= (label.getSugar() - 10) * 2.5;
        }

        // Sodium penalty: > 400mg per serving reduces score
        if (label.getSodium() > 400) {
            score -= ((label.getSodium() - 400) / 100.0) * 3.0;
        }

        // Fat penalty: > 15g per serving
        if (label.getFat() > 15) {
            score -= (label.getFat() - 15) * 1.5;
        }

        // Fiber bonus: +3 points per gram up to 15 points
        if (label.getFiber() > 0) {
            score += Math.min(15.0, label.getFiber() * 3.0);
        }

        // Protein bonus: +2 points per gram up to 20 points
        if (label.getProtein() > 0) {
            score += Math.min(20.0, label.getProtein() * 2.0);
        }

        int finalScore = (int) Math.round(score);
        return Math.max(0, Math.min(100, finalScore));
    }
}
