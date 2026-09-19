package com.nutriverify.service;

import com.nutriverify.dto.AnalyzeRequest;
import com.nutriverify.dto.AnalysisResponse;
import com.nutriverify.dto.IngredientDto;
import com.nutriverify.dto.ClaimDto;
import com.nutriverify.engine.AllergenDetector;
import com.nutriverify.engine.AuthenticityEngine;
import com.nutriverify.engine.ClaimValidator;
import com.nutriverify.engine.ComparisonEngine;
import com.nutriverify.engine.IngredientAnalyzer;
import com.nutriverify.engine.NutritionConsistencyChecker;
import com.nutriverify.engine.rules.*;
import com.nutriverify.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Web-facing analysis service that wraps existing engines for the REST API.
 */
@Service
public class WebAnalysisService {

    private final AuthenticityEngine authenticityEngine;
    private final ComparisonEngine comparisonEngine;
    private final AllergenDetector allergenDetector;

    public WebAnalysisService() {
        ClaimValidator claimValidator = new ClaimValidator(List.of(
                new NoAddedSugarRule(),
                new LowFatRule(),
                new HighProteinRule(),
                new NaturalRule(),
                new OrganicRule(),
                new NonGmoRule()));
        this.authenticityEngine = new AuthenticityEngine(
                claimValidator,
                new NutritionConsistencyChecker(),
                new IngredientAnalyzer());
        this.comparisonEngine = new ComparisonEngine();
        this.allergenDetector = new AllergenDetector();
    }

    /**
     * Analyze a product from an analyze request.
     */
    public AnalysisResponse analyze(AnalyzeRequest request, com.nutriverify.entity.UserEntity user) {
        // Map DTO to domain model
        FoodLabel label = mapToFoodLabel(request);

        // Build user profile from entity
        UserProfile userProfile = null;
        if (user != null) {
            userProfile = new UserProfile(
                    user.getFullName() != null ? user.getFullName() : user.getUsername(),
                    user.getDietaryGoals(),
                    user.getAllergens(),
                    user.getTotalScansPerformed());
        }

        // Run existing analysis engine
        AnalysisResult result = authenticityEngine.analyze(label, userProfile);

        // Detect allergens
        List<AllergenDetector.AllergenFinding> allergens = allergenDetector.detect(label);

        // Map to response DTO
        AnalysisResponse response = mapToResponse(result);

        // Set additional fields from request
        response.setSaturatedFat(request.getSaturatedFat());
        response.setTransFat(request.getTransFat());
        response.setAddedSugar(request.getAddedSugar());
        response.setCholesterol(request.getCholesterol());

        // Map allergen findings
        List<AnalysisResponse.AllergenFindingDto> allergenDtos = new ArrayList<>();
        for (AllergenDetector.AllergenFinding af : allergens) {
            allergenDtos.add(new AnalysisResponse.AllergenFindingDto(af.getAllergenName(), af.getMatchingIngredients()));
        }
        response.setAllergenFindings(allergenDtos);

        return response;
    }

    /**
     * Compare two analysis results.
     */
    public Map<String, Object> compareAnalyses(AnalysisResponse a, AnalysisResponse b) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("productA", a.getProductName());
        result.put("productB", b.getProductName());

        int aScore = a.getHealthScore() + a.getAuthenticityScore();
        int bScore = b.getHealthScore() + b.getAuthenticityScore();

        if (aScore > bScore) {
            result.put("recommended", a.getProductName());
        } else if (bScore > aScore) {
            result.put("recommended", b.getProductName());
        } else {
            result.put("recommended", "Tie");
        }

        List<Map<String, String>> metrics = new ArrayList<>();
        metrics.add(createMetric("Calories", String.valueOf(a.getCalories()), String.valueOf(b.getCalories()), "lower"));
        metrics.add(createMetric("Protein", String.valueOf(a.getProtein()), String.valueOf(b.getProtein()), "higher"));
        metrics.add(createMetric("Carbs", String.valueOf(a.getCarbs()), String.valueOf(b.getCarbs()), "lower"));
        metrics.add(createMetric("Total Fat", String.valueOf(a.getFat()), String.valueOf(b.getFat()), "lower"));
        metrics.add(createMetric("Sugar", String.valueOf(a.getSugar()), String.valueOf(b.getSugar()), "lower"));
        metrics.add(createMetric("Fiber", String.valueOf(a.getFiber()), String.valueOf(b.getFiber()), "higher"));
        metrics.add(createMetric("Sodium", String.valueOf(a.getSodium()), String.valueOf(b.getSodium()), "lower"));
        metrics.add(createMetric("Health Score", String.valueOf(a.getHealthScore()), String.valueOf(b.getHealthScore()), "higher"));
        metrics.add(createMetric("Authenticity Score", String.valueOf(a.getAuthenticityScore()), String.valueOf(b.getAuthenticityScore()), "higher"));
        result.put("metrics", metrics);

        // Generate detailed summary
        StringBuilder summary = new StringBuilder();
        if (aScore > bScore) {
            summary.append(a.getProductName()).append(" scores higher overall (").append(aScore).append(" vs ").append(bScore).append("). ");
        } else if (bScore > aScore) {
            summary.append(b.getProductName()).append(" scores higher overall (").append(bScore).append(" vs ").append(aScore).append("). ");
        } else {
            summary.append("Both products receive similar combined scores (").append(aScore).append("). ");
        }

        // Add key differences
        if (a.getHealthScore() != b.getHealthScore()) {
            String better = a.getHealthScore() > b.getHealthScore() ? a.getProductName() : b.getProductName();
            summary.append(better).append(" has better nutritional quality. ");
        }
        if (a.getSugar() != b.getSugar()) {
            String lowerSugar = a.getSugar() < b.getSugar() ? a.getProductName() : b.getProductName();
            summary.append(lowerSugar).append(" has less sugar. ");
        }
        if (a.getSodium() != b.getSodium()) {
            String lowerSodium = a.getSodium() < b.getSodium() ? a.getProductName() : b.getProductName();
            summary.append(lowerSodium).append(" has less sodium.");
        }

        result.put("summary", summary.toString());
        return result;
    }

    private Map<String, String> createMetric(String name, String valA, String valB, String preferredDirection) {
        Map<String, String> metric = new LinkedHashMap<>();
        metric.put("name", name);
        metric.put("productAValue", valA);
        metric.put("productBValue", valB);
        metric.put("preferredDirection", preferredDirection);

        try {
            double a = Double.parseDouble(valA);
            double b = Double.parseDouble(valB);
            if ("lower".equals(preferredDirection)) {
                metric.put("betterFor", a < b ? "A" : (b < a ? "B" : "TIE"));
            } else {
                metric.put("betterFor", a > b ? "A" : (b > a ? "B" : "TIE"));
            }
        } catch (NumberFormatException e) {
            metric.put("betterFor", "TIE");
        }
        return metric;
    }

    /**
     * Generate insight cards from analysis.
     */
    public List<AnalysisResponse.InsightCard> generateInsightCards(AnalysisResponse response) {
        List<AnalysisResponse.InsightCard> cards = new ArrayList<>();

        // Health score insight
        if (response.getHealthScore() >= 80) {
            cards.add(new AnalysisResponse.InsightCard("STRENGTH", "Good Health Score",
                    "This product scores " + response.getHealthScore() + "/100 for nutritional quality.", "positive"));
        } else if (response.getHealthScore() >= 50) {
            cards.add(new AnalysisResponse.InsightCard("WATCH_OUT", "Moderate Health Score",
                    "This product has a moderate health score of " + response.getHealthScore() + "/100.", "neutral"));
        } else {
            cards.add(new AnalysisResponse.InsightCard("WATCH_OUT", "Low Health Score",
                    "This product has a low health score of " + response.getHealthScore() + "/100. Consider healthier alternatives.", "warning"));
        }

        // Verification insight
        cards.add(new AnalysisResponse.InsightCard("VERIFICATION", "Label Verification",
                "Authenticity score: " + response.getAuthenticityScore() + "/100. Risk level: " + response.getRiskLevel() + ".",
                response.getAuthenticityScore() >= 80 ? "positive" : "neutral"));

        // Allergen alerts
        if (response.getAllergenFindings() != null) {
            for (AnalysisResponse.AllergenFindingDto af : response.getAllergenFindings()) {
                cards.add(new AnalysisResponse.InsightCard("ALLERGEN_ALERT",
                        "⚠ Potential Allergen: " + af.getAllergenName(),
                        "Detected in: " + String.join(", ", af.getMatchingIngredients()) + ".",
                        "warning"));
            }
        }

        // Ingredient alerts
        if (response.getIngredientRisks() != null) {
            for (AnalysisResponse.IngredientRiskDto risk : response.getIngredientRisks()) {
                String severity = risk.getCategory().contains("ARTIFICIAL") ? "warning" : "neutral";
                cards.add(new AnalysisResponse.InsightCard("INGREDIENT_ALERT",
                        risk.getCategory() + " Ingredients",
                        "Contains " + risk.getCount() + " ingredient(s) in the " + risk.getCategory().toLowerCase().replace("_", " ") + " category.",
                        severity));
            }
        }

        // Claim insights
        if (response.getClaimResults() != null) {
            for (AnalysisResponse.ClaimResultDto claim : response.getClaimResults()) {
                String severity;
                switch (claim.getVerdict()) {
                    case "VERIFIED" -> severity = "positive";
                    case "SUSPICIOUS" -> severity = "neutral";
                    default -> severity = "warning";
                }
                cards.add(new AnalysisResponse.InsightCard("CLAIM_CHECK", claim.getClaimText(),
                        claim.getVerdict() + ": " + claim.getReason(), severity));
            }
        }

        // Nutrition warnings
        if (response.getSugar() > 10) {
            cards.add(new AnalysisResponse.InsightCard("WATCH_OUT", "High Sugar Content",
                    "Contains " + response.getSugar() + "g of sugar per serving.", "warning"));
        }
        if (response.getSodium() > 400) {
            cards.add(new AnalysisResponse.InsightCard("WATCH_OUT", "High Sodium",
                    "Contains " + response.getSodium() + "mg of sodium per serving.", "warning"));
        }
        if (response.getTransFat() > 0) {
            cards.add(new AnalysisResponse.InsightCard("WATCH_OUT", "Contains Trans Fat",
                    "Contains " + response.getTransFat() + "g of trans fat per serving. Trans fats should be avoided.", "warning"));
        }

        // Strengths
        if (response.getProtein() >= 10) {
            cards.add(new AnalysisResponse.InsightCard("STRENGTH", "Good Protein Source",
                    "Contains " + response.getProtein() + "g of protein per serving.", "positive"));
        }
        if (response.getFiber() >= 3) {
            cards.add(new AnalysisResponse.InsightCard("STRENGTH", "Good Fiber Content",
                    "Contains " + response.getFiber() + "g of dietary fiber per serving.", "positive"));
        }

        return cards;
    }

    /**
     * Generate suggested follow-up questions after analysis.
     */
    public List<String> generateSuggestedQuestions(AnalysisResponse response) {
        List<String> questions = new ArrayList<>();
        questions.add("Explain this product's nutrition");

        if (response.getHealthScore() < 60) {
            questions.add("Why is the health score low?");
        } else if (response.getHealthScore() >= 80) {
            questions.add("Why is the health score good?");
        }

        if (response.getAllergenFindings() != null && !response.getAllergenFindings().isEmpty()) {
            questions.add("What allergens are present?");
        }

        if (response.getIngredientRisks() != null && !response.getIngredientRisks().isEmpty()) {
            questions.add("What ingredients should I watch?");
        }

        if (response.getClaimResults() != null && !response.getClaimResults().isEmpty()) {
            questions.add("Explain the claim verification");
        }

        if (response.getSugar() > 10) {
            questions.add("Is the sugar content high?");
        }
        if (response.getSodium() > 400) {
            questions.add("Is the sodium content concerning?");
        }

        questions.add("How does this compare to alternatives?");
        return questions;
    }

    private FoodLabel mapToFoodLabel(AnalyzeRequest request) {
        List<Ingredient> ingredients = new ArrayList<>();
        if (request.getIngredients() != null) {
            for (IngredientDto dto : request.getIngredients()) {
                IngredientCategory cat;
                try {
                    cat = IngredientCategory.valueOf(dto.getCategory().toUpperCase());
                } catch (Exception e) {
                    cat = IngredientCategory.UNKNOWN;
                }
                ingredients.add(new Ingredient(dto.getName(), cat, dto.getNote()));
            }
        }

        List<Claim> claims = new ArrayList<>();
        if (request.getClaims() != null) {
            for (ClaimDto dto : request.getClaims()) {
                ClaimType type;
                try {
                    type = ClaimType.valueOf(dto.getType().toUpperCase());
                } catch (Exception e) {
                    type = ClaimType.NON_GMO;
                }
                claims.add(new Claim(type, dto.getDisplayText()));
            }
        }

        return new FoodLabel(
                request.getProductName(),
                request.getBrand() != null ? request.getBrand() : "",
                request.getServingSize() != null ? request.getServingSize() : "",
                ingredients, claims,
                request.getCalories(), request.getFat(), request.getSugar(),
                request.getSodium(), request.getProtein(), request.getCarbs(), request.getFiber());
    }

    private AnalysisResponse mapToResponse(AnalysisResult result) {
        AnalysisResponse response = new AnalysisResponse();
        response.setProductName(result.getLabel().getProductName());
        response.setBrand(result.getLabel().getBrand());
        response.setServingSize(result.getLabel().getServingSize());
        response.setCalories(result.getLabel().getCalories());
        response.setFat(result.getLabel().getFat());
        response.setSugar(result.getLabel().getSugar());
        response.setSodium(result.getLabel().getSodium());
        response.setProtein(result.getLabel().getProtein());
        response.setCarbs(result.getLabel().getCarbs());
        response.setFiber(result.getLabel().getFiber());
        response.setAuthenticityScore(result.getAuthenticityScore());
        response.setHealthScore(result.getHealthScore());
        response.setRiskLevel(result.getRiskLevel().name());
        response.setAnalyzedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Map claim results
        List<AnalysisResponse.ClaimResultDto> claimDtos = new ArrayList<>();
        for (ClaimResult cr : result.getClaimResults()) {
            claimDtos.add(new AnalysisResponse.ClaimResultDto(
                    cr.getClaim().getDisplayText(),
                    cr.getClaim().getType().name(),
                    cr.getVerdict().name(),
                    cr.getReason()));
        }
        response.setClaimResults(claimDtos);

        // Map ingredient risks
        List<AnalysisResponse.IngredientRiskDto> riskDtos = new ArrayList<>();
        for (IngredientRisk ir : result.getIngredientRisks()) {
            riskDtos.add(new AnalysisResponse.IngredientRiskDto(ir.getCategory().name(), ir.getCount()));
        }
        response.setIngredientRisks(riskDtos);

        // Map nutrition findings
        List<AnalysisResponse.NutritionFindingDto> findingDtos = new ArrayList<>();
        for (NutritionConsistencyFinding nf : result.getNutritionFindings()) {
            findingDtos.add(new AnalysisResponse.NutritionFindingDto(nf.getMessage(), nf.isProblematic()));
        }
        response.setNutritionFindings(findingDtos);

        response.setRecommendations(result.getRecommendations());

        return response;
    }
}
