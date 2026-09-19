package com.nutriverify.engine;

import com.nutriverify.model.FoodLabel;
import com.nutriverify.model.Ingredient;

import java.util.*;

/**
 * Detects potential allergens in food product ingredients using keyword matching.
 * Uses cautious language — "Potential Allergen" rather than claiming medical certainty.
 */
public class AllergenDetector {

    private static final Map<String, Set<String>> ALLERGEN_KEYWORDS = new LinkedHashMap<>();

    static {
        ALLERGEN_KEYWORDS.put("Milk", Set.of("milk", "cream", "butter", "cheese", "whey", "casein", "lactose", "dairy", "ghee", "curd", "yogurt"));
        ALLERGEN_KEYWORDS.put("Eggs", Set.of("egg", "eggs", "albumin", "mayonnaise", "meringue"));
        ALLERGEN_KEYWORDS.put("Peanuts", Set.of("peanut", "peanuts", "groundnut"));
        ALLERGEN_KEYWORDS.put("Tree Nuts", Set.of("almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut", "macadamia", "brazil nut", "chestnut"));
        ALLERGEN_KEYWORDS.put("Soy", Set.of("soy", "soya", "soybean", "tofu", "edamame", "lecithin"));
        ALLERGEN_KEYWORDS.put("Wheat", Set.of("wheat", "flour", "maida", "semolina", "gluten", "breadcrumb", "bulgur", "couscous"));
        ALLERGEN_KEYWORDS.put("Fish", Set.of("fish", "salmon", "tuna", "cod", "anchov", "sardine", "tilapia", "basa", "rohu"));
        ALLERGEN_KEYWORDS.put("Shellfish", Set.of("shrimp", "prawn", "crab", "lobster", "mussel", "clam", "oyster", "squid", "calamari"));
        ALLERGEN_KEYWORDS.put("Sesame", Set.of("sesame", "tahini", "til"));
    }

    /**
     * Detect potential allergens from the ingredient list.
     * Returns a list of detected allergens with the matching ingredients.
     */
    public List<AllergenFinding> detect(FoodLabel label) {
        Map<String, List<String>> detected = new LinkedHashMap<>();

        for (Ingredient ingredient : label.getIngredients()) {
            String nameLower = ingredient.getName().toLowerCase(Locale.ROOT);
            for (Map.Entry<String, Set<String>> entry : ALLERGEN_KEYWORDS.entrySet()) {
                for (String keyword : entry.getValue()) {
                    if (nameLower.contains(keyword)) {
                        detected.computeIfAbsent(entry.getKey(), k -> new ArrayList<>())
                                .add(ingredient.getName());
                        break;
                    }
                }
            }
        }

        List<AllergenFinding> findings = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : detected.entrySet()) {
            findings.add(new AllergenFinding(entry.getKey(), entry.getValue()));
        }
        return findings;
    }

    /**
     * Check if any user allergens match the product.
     * Returns matched allergen pairs (user allergen → matching ingredient).
     */
    public List<PersonalAllergenAlert> checkPersonalAllergens(FoodLabel label, List<String> userAllergens) {
        List<PersonalAllergenAlert> alerts = new ArrayList<>();
        if (userAllergens == null || userAllergens.isEmpty()) return alerts;

        for (String userAllergen : userAllergens) {
            if (userAllergen.isBlank()) continue;
            String allergenLower = userAllergen.toLowerCase().trim();
            for (Ingredient ingredient : label.getIngredients()) {
                if (ingredient.getName().toLowerCase(Locale.ROOT).contains(allergenLower)) {
                    alerts.add(new PersonalAllergenAlert(userAllergen, ingredient.getName()));
                }
            }
        }
        return alerts;
    }

    /**
     * A single allergen detection finding.
     */
    public static class AllergenFinding {
        private final String allergenName;
        private final List<String> matchingIngredients;

        public AllergenFinding(String allergenName, List<String> matchingIngredients) {
            this.allergenName = allergenName;
            this.matchingIngredients = matchingIngredients;
        }

        public String getAllergenName() { return allergenName; }
        public List<String> getMatchingIngredients() { return matchingIngredients; }
    }

    /**
     * A personal allergen alert when a user's known allergen matches an ingredient.
     */
    public static class PersonalAllergenAlert {
        private final String userAllergen;
        private final String matchingIngredient;

        public PersonalAllergenAlert(String userAllergen, String matchingIngredient) {
            this.userAllergen = userAllergen;
            this.matchingIngredient = matchingIngredient;
        }

        public String getUserAllergen() { return userAllergen; }
        public String getMatchingIngredient() { return matchingIngredient; }
    }
}
