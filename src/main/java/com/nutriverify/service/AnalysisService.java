package com.nutriverify.service;

import com.nutriverify.engine.AuthenticityEngine;
import com.nutriverify.model.AnalysisResult;
import com.nutriverify.model.FoodLabel;
import com.nutriverify.model.UserProfile;

/**
 * Orchestrates the complete analysis workflow for a food label.
 */
public class AnalysisService {
    private final AuthenticityEngine authenticityEngine;

    public AnalysisService(AuthenticityEngine authenticityEngine) {
        this.authenticityEngine = authenticityEngine;
    }

    public AnalysisResult analyze(FoodLabel label) {
        return authenticityEngine.analyze(label);
    }

    public AnalysisResult analyze(FoodLabel label, UserProfile userProfile) {
        return authenticityEngine.analyze(label, userProfile);
    }
}
