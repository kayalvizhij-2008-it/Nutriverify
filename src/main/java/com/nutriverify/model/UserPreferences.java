package com.nutriverify.model;

/**
 * Model encapsulating configurable application settings and validation thresholds.
 */
public class UserPreferences {
    private double customLowFatThreshold;
    private double customHighProteinThreshold;
    private double maxDailySugarTarget;
    private boolean enableAnsiColors;

    public UserPreferences() {
        this.customLowFatThreshold = 3.0;
        this.customHighProteinThreshold = 10.0;
        this.maxDailySugarTarget = 25.0;
        this.enableAnsiColors = true;
    }

    public UserPreferences(double customLowFatThreshold, double customHighProteinThreshold, double maxDailySugarTarget, boolean enableAnsiColors) {
        this.customLowFatThreshold = customLowFatThreshold;
        this.customHighProteinThreshold = customHighProteinThreshold;
        this.maxDailySugarTarget = maxDailySugarTarget;
        this.enableAnsiColors = enableAnsiColors;
    }

    public double getCustomLowFatThreshold() {
        return customLowFatThreshold;
    }

    public void setCustomLowFatThreshold(double customLowFatThreshold) {
        this.customLowFatThreshold = customLowFatThreshold;
    }

    public double getCustomHighProteinThreshold() {
        return customHighProteinThreshold;
    }

    public void setCustomHighProteinThreshold(double customHighProteinThreshold) {
        this.customHighProteinThreshold = customHighProteinThreshold;
    }

    public double getMaxDailySugarTarget() {
        return maxDailySugarTarget;
    }

    public void setMaxDailySugarTarget(double maxDailySugarTarget) {
        this.maxDailySugarTarget = maxDailySugarTarget;
    }

    public boolean isEnableAnsiColors() {
        return enableAnsiColors;
    }

    public void setEnableAnsiColors(boolean enableAnsiColors) {
        this.enableAnsiColors = enableAnsiColors;
    }
}
