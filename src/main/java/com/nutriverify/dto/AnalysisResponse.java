package com.nutriverify.dto;

import java.util.List;

/**
 * DTO for analysis result response.
 */
public class AnalysisResponse {
    private Long historyId;
    private String productName;
    private String brand;
    private String servingSize;

    // Nutrition data
    private double calories;
    private double fat;
    private double saturatedFat;
    private double transFat;
    private double sugar;
    private double addedSugar;
    private double sodium;
    private double protein;
    private double carbs;
    private double fiber;
    private double cholesterol;

    // Analysis scores
    private int authenticityScore;
    private int healthScore;
    private String riskLevel;

    // Detailed results
    private List<ClaimResultDto> claimResults;
    private List<IngredientRiskDto> ingredientRisks;
    private List<NutritionFindingDto> nutritionFindings;
    private List<String> recommendations;
    private List<InsightCard> insightCards;
    private List<AllergenFindingDto> allergenFindings;

    // Confidence scores
    private java.util.Map<String, Double> confidenceScores;

    // Follow-up suggestions
    private List<String> suggestedQuestions;

    private String analyzedAt;

    public AnalysisResponse() {}

    // Getters and Setters
    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    public double getCalories() { return calories; }
    public void setCalories(double calories) { this.calories = calories; }
    public double getFat() { return fat; }
    public void setFat(double fat) { this.fat = fat; }
    public double getSaturatedFat() { return saturatedFat; }
    public void setSaturatedFat(double saturatedFat) { this.saturatedFat = saturatedFat; }
    public double getTransFat() { return transFat; }
    public void setTransFat(double transFat) { this.transFat = transFat; }
    public double getSugar() { return sugar; }
    public void setSugar(double sugar) { this.sugar = sugar; }
    public double getAddedSugar() { return addedSugar; }
    public void setAddedSugar(double addedSugar) { this.addedSugar = addedSugar; }
    public double getSodium() { return sodium; }
    public void setSodium(double sodium) { this.sodium = sodium; }
    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }
    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }
    public double getFiber() { return fiber; }
    public void setFiber(double fiber) { this.fiber = fiber; }
    public double getCholesterol() { return cholesterol; }
    public void setCholesterol(double cholesterol) { this.cholesterol = cholesterol; }
    public int getAuthenticityScore() { return authenticityScore; }
    public void setAuthenticityScore(int authenticityScore) { this.authenticityScore = authenticityScore; }
    public int getHealthScore() { return healthScore; }
    public void setHealthScore(int healthScore) { this.healthScore = healthScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public List<ClaimResultDto> getClaimResults() { return claimResults; }
    public void setClaimResults(List<ClaimResultDto> claimResults) { this.claimResults = claimResults; }
    public List<IngredientRiskDto> getIngredientRisks() { return ingredientRisks; }
    public void setIngredientRisks(List<IngredientRiskDto> ingredientRisks) { this.ingredientRisks = ingredientRisks; }
    public List<NutritionFindingDto> getNutritionFindings() { return nutritionFindings; }
    public void setNutritionFindings(List<NutritionFindingDto> nutritionFindings) { this.nutritionFindings = nutritionFindings; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    public List<InsightCard> getInsightCards() { return insightCards; }
    public void setInsightCards(List<InsightCard> insightCards) { this.insightCards = insightCards; }
    public List<AllergenFindingDto> getAllergenFindings() { return allergenFindings; }
    public void setAllergenFindings(List<AllergenFindingDto> allergenFindings) { this.allergenFindings = allergenFindings; }
    public java.util.Map<String, Double> getConfidenceScores() { return confidenceScores; }
    public void setConfidenceScores(java.util.Map<String, Double> confidenceScores) { this.confidenceScores = confidenceScores; }
    public List<String> getSuggestedQuestions() { return suggestedQuestions; }
    public void setSuggestedQuestions(List<String> suggestedQuestions) { this.suggestedQuestions = suggestedQuestions; }
    public String getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(String analyzedAt) { this.analyzedAt = analyzedAt; }

    // Nested DTOs
    public static class ClaimResultDto {
        private String claimText;
        private String claimType;
        private String verdict;
        private String reason;

        public ClaimResultDto() {}
        public ClaimResultDto(String claimText, String claimType, String verdict, String reason) {
            this.claimText = claimText;
            this.claimType = claimType;
            this.verdict = verdict;
            this.reason = reason;
        }
        public String getClaimText() { return claimText; }
        public void setClaimText(String claimText) { this.claimText = claimText; }
        public String getClaimType() { return claimType; }
        public void setClaimType(String claimType) { this.claimType = claimType; }
        public String getVerdict() { return verdict; }
        public void setVerdict(String verdict) { this.verdict = verdict; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class IngredientRiskDto {
        private String category;
        private long count;

        public IngredientRiskDto() {}
        public IngredientRiskDto(String category, long count) {
            this.category = category;
            this.count = count;
        }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class NutritionFindingDto {
        private String message;
        private boolean problematic;

        public NutritionFindingDto() {}
        public NutritionFindingDto(String message, boolean problematic) {
            this.message = message;
            this.problematic = problematic;
        }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public boolean isProblematic() { return problematic; }
        public void setProblematic(boolean problematic) { this.problematic = problematic; }
    }

    public static class AllergenFindingDto {
        private String allergenName;
        private java.util.List<String> matchingIngredients;

        public AllergenFindingDto() {}
        public AllergenFindingDto(String allergenName, java.util.List<String> matchingIngredients) {
            this.allergenName = allergenName;
            this.matchingIngredients = matchingIngredients;
        }
        public String getAllergenName() { return allergenName; }
        public void setAllergenName(String allergenName) { this.allergenName = allergenName; }
        public java.util.List<String> getMatchingIngredients() { return matchingIngredients; }
        public void setMatchingIngredients(java.util.List<String> matchingIngredients) { this.matchingIngredients = matchingIngredients; }
    }

    public static class InsightCard {
        private String type; // STRENGTH, WATCH_OUT, INGREDIENT_ALERT, CLAIM_CHECK, ALLERGEN_ALERT, VERIFICATION
        private String title;
        private String description;
        private String severity; // positive, neutral, warning, critical

        public InsightCard() {}
        public InsightCard(String type, String title, String description, String severity) {
            this.type = type;
            this.title = title;
            this.description = description;
            this.severity = severity;
        }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }
}
