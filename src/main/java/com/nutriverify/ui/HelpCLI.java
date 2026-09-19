package com.nutriverify.ui;

import com.nutriverify.config.AppConfig;
import com.nutriverify.util.AnsiColors;

import java.util.Scanner;

/**
 * Controller providing detailed application documentation and rule system guides.
 */
public class HelpCLI {
    private final Scanner scanner;

    public HelpCLI(Scanner scanner) {
        this.scanner = scanner;
    }

    public void showHelpMenu() {
        while (true) {
            System.out.println("\n" + AnsiColors.bold("=== NUTRIVERIFY HELP & DOCUMENTATION ==="));
            System.out.println("1. How Authenticity Scoring Works");
            System.out.println("2. Claim Verification Rules Explained");
            System.out.println("3. Ingredient Risk Classification Guide");
            System.out.println("4. About NutriVerify Software Architecture");
            System.out.println("5. Back to Main Dashboard");
            System.out.print(AnsiColors.cyan("Select option (1-5): "));

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> showAuthenticityHelp();
                case "2" -> showClaimRulesHelp();
                case "3" -> showIngredientRiskHelp();
                case "4" -> showAboutApp();
                case "5" -> {
                    return;
                }
                default -> System.out.println(AnsiColors.warning("Invalid option. Choose 1-5."));
            }
        }
    }

    private void showAuthenticityHelp() {
        System.out.println("\n" + AnsiColors.bold("--- AUTHENTICITY SCORING ENGINE ---"));
        System.out.println("NutriVerify calculates a weighted score (0-100) based on 3 core pillars:");
        System.out.println(" • Marketing Claims (Weight: " + (AppConfig.CLAIM_WEIGHT * 100) + "%): Evaluates if label claims match nutrition facts.");
        System.out.println(" • Nutrition Consistency (Weight: " + (AppConfig.NUTRITION_WEIGHT * 100) + "%): Verifies mathematical consistency of macros & calories.");
        System.out.println(" • Ingredient Safety (Weight: " + (AppConfig.INGREDIENT_WEIGHT * 100) + "%): Penalizes artificial colors, preservatives, MSG, and palm oil.");
        System.out.println("\nRisk Levels:");
        System.out.println(" 🟢 90-100: TRUSTED");
        System.out.println(" 🔵 75-89 : LOW RISK");
        System.out.println(" 🟡 60-74 : MODERATE RISK");
        System.out.println(" 🟠 40-59 : HIGH RISK");
        System.out.println(" 🔴  0-39 : CRITICAL RISK");
    }

    private void showClaimRulesHelp() {
        System.out.println("\n" + AnsiColors.bold("--- CLAIM VERIFICATION RULES ---"));
        System.out.println("1. No Added Sugar : Flagged if sugar > 0.5g or ingredients contain corn syrup, dextrose, or sucrose.");
        System.out.println("2. Low Fat         : Requires fat <= 3.0g per serving.");
        System.out.println("3. High Protein    : Requires protein >= 10.0g per serving.");
        System.out.println("4. Natural         : Flagged if ingredients contain artificial colors, flavors, or synthetic preservatives.");
        System.out.println("5. Non-GMO         : Flagged if ingredients contain soy or corn derivatives without organic certification.");
    }

    private void showIngredientRiskHelp() {
        System.out.println("\n" + AnsiColors.bold("--- INGREDIENT RISK CATEGORIES ---"));
        System.out.println(" • ARTIFICIAL   : Synthetic dyes, artificial sweeteners (sucralose, aspartame).");
        System.out.println(" • PRESERVATIVE : Chemical preservatives (BHT, sodium benzoate, nitrates).");
        System.out.println(" • SWEETENER    : High fructose corn syrup, refined sugars.");
        System.out.println(" • GMO_DERIVED  : Uncertified soy lecithin, maltodextrin, corn starch.");
        System.out.println(" • ALLERGEN     : Common allergens (milk, peanuts, wheat, eggs).");
    }

    private void showAboutApp() {
        System.out.println("\n" + AnsiColors.bold("--- ABOUT NUTRIVERIFY ---"));
        System.out.println(AppConfig.APP_NAME + " v1.0 Enterprise Core Java Edition");
        System.out.println("Architecture : Modular Clean Architecture & SOLID Principles");
        System.out.println("Interface    : Pure ANSI Terminal Console (Zero Web/GUI Dependencies)");
        System.out.println("Persistence  : Local File System (CSV / Properties / Pure Java Serialization)");
    }
}
