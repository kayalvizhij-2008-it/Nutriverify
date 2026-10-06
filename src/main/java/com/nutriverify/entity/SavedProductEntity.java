package com.nutriverify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity for saved/bookmarked products.
 */
@Entity
@Table(name = "saved_products")
public class SavedProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 200)
    private String productName;

    @Column(length = 200)
    private String brand;

    @Column(length = 50)
    private String servingSize;

    private double calories;
    private double fat;
    private double sugar;
    private double sodium;
    private double protein;
    private double carbs;
    private double fiber;

    private int authenticityScore;
    private int healthScore;
    private String riskLevel;

    @Column(columnDefinition = "TEXT")
    private String ingredients; // JSON
    @Column(columnDefinition = "TEXT")
    private String claims; // JSON
    @Column(columnDefinition = "TEXT")
    private String claimResults; // JSON
    @Column(columnDefinition = "TEXT")
    private String ingredientRisks; // JSON
    @Column(columnDefinition = "TEXT")
    private String nutritionFindings; // JSON
    @Column(columnDefinition = "TEXT")
    private String recommendations; // JSON

    @Column(nullable = false)
    private LocalDateTime savedAt;

    @Column(nullable = false)
    private LocalDateTime analyzedAt;

    public SavedProductEntity() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
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
    public double getSugar() { return sugar; }
    public void setSugar(double sugar) { this.sugar = sugar; }
    public double getSodium() { return sodium; }
    public void setSodium(double sodium) { this.sodium = sodium; }
    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }
    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }
    public double getFiber() { return fiber; }
    public void setFiber(double fiber) { this.fiber = fiber; }
    public int getAuthenticityScore() { return authenticityScore; }
    public void setAuthenticityScore(int authenticityScore) { this.authenticityScore = authenticityScore; }
    public int getHealthScore() { return healthScore; }
    public void setHealthScore(int healthScore) { this.healthScore = healthScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getClaims() { return claims; }
    public void setClaims(String claims) { this.claims = claims; }
    public String getClaimResults() { return claimResults; }
    public void setClaimResults(String claimResults) { this.claimResults = claimResults; }
    public String getIngredientRisks() { return ingredientRisks; }
    public void setIngredientRisks(String ingredientRisks) { this.ingredientRisks = ingredientRisks; }
    public String getNutritionFindings() { return nutritionFindings; }
    public void setNutritionFindings(String nutritionFindings) { this.nutritionFindings = nutritionFindings; }
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
