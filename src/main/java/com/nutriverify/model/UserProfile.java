package com.nutriverify.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Encapsulates user preferences, dietary constraints, and usage stats.
 */
public class UserProfile {
    private String fullName;
    private List<String> dietaryGoals;
    private List<String> allergens;
    private int totalScansPerformed;

    public UserProfile(String fullName) {
        this.fullName = fullName;
        this.dietaryGoals = new ArrayList<>();
        this.allergens = new ArrayList<>();
        this.totalScansPerformed = 0;
    }

    public UserProfile(String fullName, List<String> dietaryGoals, List<String> allergens, int totalScansPerformed) {
        this.fullName = fullName;
        this.dietaryGoals = dietaryGoals != null ? dietaryGoals : new ArrayList<>();
        this.allergens = allergens != null ? allergens : new ArrayList<>();
        this.totalScansPerformed = totalScansPerformed;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public List<String> getDietaryGoals() {
        return dietaryGoals;
    }

    public void setDietaryGoals(List<String> dietaryGoals) {
        this.dietaryGoals = dietaryGoals;
    }

    public List<String> getAllergens() {
        return allergens;
    }

    public void setAllergens(List<String> allergens) {
        this.allergens = allergens;
    }

    public int getTotalScansPerformed() {
        return totalScansPerformed;
    }

    public void incrementScanCount() {
        this.totalScansPerformed++;
    }

    public void setTotalScansPerformed(int totalScansPerformed) {
        this.totalScansPerformed = totalScansPerformed;
    }
}
