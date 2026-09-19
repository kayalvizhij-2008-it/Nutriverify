package com.nutriverify.dto;

import java.util.List;

/**
 * DTO for comparison response.
 */
public class CompareResponse {
    private String productA;
    private String productB;
    private String summary;
    private List<MetricComparison> metrics;
    private int productAScore;
    private int productBScore;
    private String recommendedProduct;

    public CompareResponse() {}

    // Getters and Setters
    public String getProductA() { return productA; }
    public void setProductA(String productA) { this.productA = productA; }
    public String getProductB() { return productB; }
    public void setProductB(String productB) { this.productB = productB; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public List<MetricComparison> getMetrics() { return metrics; }
    public void setMetrics(List<MetricComparison> metrics) { this.metrics = metrics; }
    public int getProductAScore() { return productAScore; }
    public void setProductAScore(int productAScore) { this.productAScore = productAScore; }
    public int getProductBScore() { return productBScore; }
    public void setProductBScore(int productBScore) { this.productBScore = productBScore; }
    public String getRecommendedProduct() { return recommendedProduct; }
    public void setRecommendedProduct(String recommendedProduct) { this.recommendedProduct = recommendedProduct; }

    public static class MetricComparison {
        private String name;
        private String productAValue;
        private String productBValue;
        private String betterFor; // A, B, TIE
        private String description;

        public MetricComparison() {}
        public MetricComparison(String name, String productAValue, String productBValue, String betterFor, String description) {
            this.name = name;
            this.productAValue = productAValue;
            this.productBValue = productBValue;
            this.betterFor = betterFor;
            this.description = description;
        }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getProductAValue() { return productAValue; }
        public void setProductAValue(String productAValue) { this.productAValue = productAValue; }
        public String getProductBValue() { return productBValue; }
        public void setProductBValue(String productBValue) { this.productBValue = productBValue; }
        public String getBetterFor() { return betterFor; }
        public void setBetterFor(String betterFor) { this.betterFor = betterFor; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
