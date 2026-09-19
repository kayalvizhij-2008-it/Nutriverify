package com.nutriverify.engine;

import com.nutriverify.model.AnalysisResult;

import java.util.ArrayList;
import java.util.List;

/**
 * Compares two product label analysis outcomes side-by-side.
 */
public class ComparisonEngine {

    public String compare(AnalysisResult left, AnalysisResult right) {
        int leftTotal = left.getAuthenticityScore() + left.getHealthScore();
        int rightTotal = right.getAuthenticityScore() + right.getHealthScore();

        if (leftTotal == rightTotal) {
            return "Both products receive an identical combined score (" + leftTotal + " pts). Choice is a tie.";
        }
        if (leftTotal > rightTotal) {
            return left.getLabel().getProductName() + " is recommended (Combined Score: " + leftTotal + " vs " + rightTotal + ").";
        }
        return right.getLabel().getProductName() + " is recommended (Combined Score: " + rightTotal + " vs " + leftTotal + ").";
    }

    public List<String> differences(AnalysisResult left, AnalysisResult right) {
        List<String> differences = new ArrayList<>();
        differences.add("Authenticity Score : " + left.getLabel().getProductName() + " (" + left.getAuthenticityScore() + ") vs " + right.getLabel().getProductName() + " (" + right.getAuthenticityScore() + ")");
        differences.add("Health Score       : " + left.getLabel().getProductName() + " (" + left.getHealthScore() + ") vs " + right.getLabel().getProductName() + " (" + right.getHealthScore() + ")");
        differences.add("Risk Classification: " + left.getLabel().getProductName() + " (" + left.getRiskLevel() + ") vs " + right.getLabel().getProductName() + " (" + right.getRiskLevel() + ")");
        differences.add("Sugar Content      : " + left.getLabel().getProductName() + " (" + left.getLabel().getSugar() + "g) vs " + right.getLabel().getProductName() + " (" + right.getLabel().getSugar() + "g)");
        differences.add("Sodium Content     : " + left.getLabel().getProductName() + " (" + left.getLabel().getSodium() + "mg) vs " + right.getLabel().getProductName() + " (" + right.getLabel().getSodium() + "mg)");
        return differences;
    }
}
