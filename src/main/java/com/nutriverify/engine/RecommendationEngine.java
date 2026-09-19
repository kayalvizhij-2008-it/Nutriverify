package com.nutriverify.engine;

import com.nutriverify.model.FoodLabel;
import com.nutriverify.model.Ingredient;
import com.nutriverify.model.UserProfile;

import java.util.ArrayList;
import java.util.List;

/**
 * Intelligent recommendation engine delivering personalized dietary advisories.
 */
public class RecommendationEngine {

    public List<String> generatePersonalizedRecommendations(FoodLabel label, UserProfile userProfile, int healthScore) {
        List<String> recommendations = new ArrayList<>();

        if (userProfile != null) {
            // Allergen matching
            for (String allergen : userProfile.getAllergens()) {
                if (allergen.isBlank()) continue;
                for (Ingredient ingredient : label.getIngredients()) {
                    if (ingredient.getName().toLowerCase().contains(allergen.toLowerCase().trim())) {
                        recommendations.add("CRITICAL ALLERGEN WARNING: Product contains '" + ingredient.getName() + "' which matches registered allergen profile: " + allergen);
                    }
                }
            }

            // Goal checks
            for (String goal : userProfile.getDietaryGoals()) {
                String normalized = goal.toLowerCase().trim();
                if (normalized.contains("low sugar") && label.getSugar() > 5.0) {
                    recommendations.add("Goal Conflict: High sugar content (" + label.getSugar() + "g) conflicts with your 'Low Sugar' goal.");
                }
                if (normalized.contains("low sodium") && label.getSodium() > 300.0) {
                    recommendations.add("Goal Conflict: High sodium content (" + label.getSodium() + "mg) conflicts with your 'Low Sodium' goal.");
                }
                if (normalized.contains("high protein") && label.getProtein() < 10.0) {
                    recommendations.add("Goal Advice: Protein content (" + label.getProtein() + "g) is below your 'High Protein' goal target (10g+).");
                }
            }
        }

        // General health recommendations based on healthScore
        if (healthScore >= 80) {
            recommendations.add("Nutritional Summary: High nutrient density product suitable for daily consumption.");
        } else if (healthScore >= 50) {
            recommendations.add("Nutritional Summary: Moderate health profile. Consume in moderation.");
        } else {
            recommendations.add("Nutritional Summary: Low nutritional score due to high sugars, sodium, or fats. Seek healthier alternatives.");
        }

        return recommendations;
    }
}
