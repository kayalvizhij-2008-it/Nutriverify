package com.nutriverify.engine.rules;

import com.nutriverify.config.AppConfig;
import com.nutriverify.engine.ClaimRule;
import com.nutriverify.model.Claim;
import com.nutriverify.model.ClaimResult;
import com.nutriverify.model.ClaimType;
import com.nutriverify.model.ClaimVerdict;
import com.nutriverify.model.FoodLabel;

/**
 * Validates the Low Sodium claim.
 */
public class LowSodiumRule implements ClaimRule {
    @Override
    public boolean supports(Claim claim) {
        return claim.getType() == ClaimType.LOW_SODIUM;
    }

    @Override
    public ClaimResult evaluate(FoodLabel label, Claim claim) {
        if (label.getSodium() <= AppConfig.LOW_SODIUM_THRESHOLD) {
            return new ClaimResult(claim, ClaimVerdict.VERIFIED,
                    "Sodium content of " + label.getSodium() + "mg is at or below the low-sodium threshold of "
                            + AppConfig.LOW_SODIUM_THRESHOLD + "mg per serving.");
        }
        return new ClaimResult(claim, ClaimVerdict.FALSE,
                "Sodium content of " + label.getSodium() + "mg exceeds the low-sodium threshold of "
                        + AppConfig.LOW_SODIUM_THRESHOLD + "mg per serving.");
    }
}
