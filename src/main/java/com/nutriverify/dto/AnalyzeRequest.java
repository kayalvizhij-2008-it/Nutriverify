package com.nutriverify.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AnalyzeRequest {
    @NotBlank(message = "Product name is required")
    private String productName;

    private String brand;
    private String servingSize;
    private List<IngredientDto> ingredients;
    private List<ClaimDto> claims;

    // Core nutrition data
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

    // Optional: correct values from OCR
    private Long documentId;

    public AnalyzeRequest() {}

    // Getters and Setters
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    public List<IngredientDto> getIngredients() { return ingredients; }
    public void setIngredients(List<IngredientDto> ingredients) { this.ingredients = ingredients; }
    public List<ClaimDto> getClaims() { return claims; }
    public void setClaims(List<ClaimDto> claims) { this.claims = claims; }
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
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
}
