package com.nutriverify.engine.rules;

import com.nutriverify.config.AppConfig;
import com.nutriverify.engine.ClaimRule;
import com.nutriverify.model.Claim;
import com.nutriverify.model.ClaimResult;
import com.nutriverify.model.ClaimType;
import com.nutriverify.model.ClaimVerdict;
import com.nutriverify.model.FoodLabel;

/**
 * Validates the High Fiber claim.
 */
public class HighFiberRule implements ClaimRule {
    @Override
    public boolean supports(Claim claim) {
        return claim.getType() == ClaimType.HIGH_FIBER;
    }

    @Override
    public ClaimResult evaluate(FoodLabel label, Claim claim) {
        if (label.getFiber() >= AppConfig.HIGH_FIBER_THRESHOLD) {
            return new ClaimResult(claim, ClaimVerdict.VERIFIED,
                    "Fiber content meets the high-fiber threshold of " + AppConfig.HIGH_FIBER_THRESHOLD + "g per serving.");
        }
        return new ClaimResult(claim, ClaimVerdict.FALSE,
                "Fiber content of " + label.getFiber() + "g falls below the high-fiber threshold of "
                        + AppConfig.HIGH_FIBER_THRESHOLD + "g per serving.");
    }
}
