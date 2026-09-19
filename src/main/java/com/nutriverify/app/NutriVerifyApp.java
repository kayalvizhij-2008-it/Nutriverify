package com.nutriverify.app;

import com.nutriverify.engine.AuthenticityEngine;
import com.nutriverify.engine.ClaimValidator;
import com.nutriverify.engine.ComparisonEngine;
import com.nutriverify.engine.IngredientAnalyzer;
import com.nutriverify.engine.NutritionConsistencyChecker;
import com.nutriverify.engine.rules.HighProteinRule;
import com.nutriverify.engine.rules.LowFatRule;
import com.nutriverify.engine.rules.NaturalRule;
import com.nutriverify.engine.rules.NoAddedSugarRule;
import com.nutriverify.engine.rules.NonGmoRule;
import com.nutriverify.engine.rules.OrganicRule;
import com.nutriverify.exception.DatasetLoadException;
import com.nutriverify.exception.InvalidLabelDataException;
import com.nutriverify.exception.ReportExportException;
import com.nutriverify.model.AnalysisResult;
import com.nutriverify.model.Claim;
import com.nutriverify.model.ClaimType;
import com.nutriverify.model.FoodLabel;
import com.nutriverify.model.Ingredient;
import com.nutriverify.model.IngredientCategory;
import com.nutriverify.model.Report;
import com.nutriverify.model.User;
import com.nutriverify.repository.IngredientDatasetRepository;
import com.nutriverify.repository.UserRepository;
import com.nutriverify.service.AnalysisService;
import com.nutriverify.service.AuthService;
import com.nutriverify.service.HistoryService;
import com.nutriverify.service.ReportService;
import com.nutriverify.service.SettingsService;
import com.nutriverify.ui.AuthCLI;
import com.nutriverify.ui.ConsoleRenderer;
import com.nutriverify.ui.HelpCLI;
import com.nutriverify.ui.ProfileCLI;
import com.nutriverify.ui.SettingsCLI;
import com.nutriverify.util.AnsiColors;
import com.nutriverify.util.InputValidator;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

/**
 * Enterprise Application Dashboard and Execution Loop for NutriVerify.
 */
public class NutriVerifyApp {
    private final Scanner scanner = new Scanner(System.in);
    private final ConsoleRenderer renderer = new ConsoleRenderer();
    
    // Repositories
    private final IngredientDatasetRepository repository = new IngredientDatasetRepository();
    private final UserRepository userRepository = new UserRepository();

    // Services & Engines
    private final AuthService authService = new AuthService(userRepository);
    private final SettingsService settingsService = new SettingsService();
    private final AuthenticityEngine engine = new AuthenticityEngine(
            new ClaimValidator(List.of(
                    new NoAddedSugarRule(),
                    new LowFatRule(),
                    new HighProteinRule(),
                    new NaturalRule(),
                    new OrganicRule(),
                    new NonGmoRule())),
            new NutritionConsistencyChecker(),
            new IngredientAnalyzer());
    private final AnalysisService analysisService = new AnalysisService(engine);
    private final ReportService reportService = new ReportService();
    private final HistoryService historyService = new HistoryService();
    private final ComparisonEngine comparisonEngine = new ComparisonEngine();

    // UI Controllers
    private final AuthCLI authCLI = new AuthCLI(authService, renderer, scanner);
    private final ProfileCLI profileCLI = new ProfileCLI(authService, scanner);
    private final SettingsCLI settingsCLI = new SettingsCLI(settingsService, scanner);
    private final HelpCLI helpCLI = new HelpCLI(scanner);

    private Report currentReport;

    public void run() {
        renderer.printBanner();
        renderer.printLoadingAnimation();
        renderer.printProgressBar(100);

        // Access Portal / Authentication Loop
        boolean proceed = authCLI.showAuthMenu();
        if (!proceed) {
            return;
        }

        System.out.println(AnsiColors.info("Session active. Accessing NutriVerify Dashboard..."));

        // Main Dashboard Loop
        while (authService.isAuthenticated()) {
            User currentUser = authService.getCurrentUser();
            renderer.printMenu(currentUser.getUsername());
            System.out.print(AnsiColors.cyan("Select option (1-9): "));
            String input = scanner.nextLine().trim();

            if (InputValidator.isBlank(input)) {
                System.out.println(AnsiColors.warning("Please select a valid option."));
                continue;
            }

            switch (input) {
                case "1" -> handleAnalyzeLabel();
                case "2" -> handleCompareProducts();
                case "3" -> handleIngredientSearch();
                case "4" -> handleHistory();
                case "5" -> handleExport();
                case "6" -> profileCLI.showProfileMenu();
                case "7" -> settingsCLI.showSettingsMenu();
                case "8" -> helpCLI.showHelpMenu();
                case "9" -> {
                    authService.logout();
                    System.out.println(AnsiColors.success("Logged out successfully. Goodbye!"));
                    return;
                }
                default -> System.out.println(AnsiColors.warning("Invalid menu selection. Please choose 1-9."));
            }
        }
    }

    private void handleAnalyzeLabel() {
        try {
            FoodLabel label = promptForLabel();
            User user = authService.getCurrentUser();
            AnalysisResult result = analysisService.analyze(label, user != null ? user.getProfile() : null);
            currentReport = reportService.createReport(result);
            renderer.printReport(result);

            if (user != null) {
                user.getProfile().incrementScanCount();
                userRepository.save(user);
                historyService.save(currentReport, user.getUsername());
            } else {
                historyService.save(currentReport, "guest");
            }
            System.out.println(AnsiColors.success("Analysis complete and logged to history."));
        } catch (Exception ex) {
            System.out.println(AnsiColors.danger("Analysis failed: " + ex.getMessage()));
        }
    }

    private void handleCompareProducts() {
        try {
            System.out.println("\n" + AnsiColors.bold("--- PRODUCT COMPARISON (FIRST ITEM) ---"));
            FoodLabel first = promptForLabel();
            System.out.println("\n" + AnsiColors.bold("--- PRODUCT COMPARISON (SECOND ITEM) ---"));
            FoodLabel second = promptForLabel();

            User user = authService.getCurrentUser();
            AnalysisResult firstResult = analysisService.analyze(first, user != null ? user.getProfile() : null);
            AnalysisResult secondResult = analysisService.analyze(second, user != null ? user.getProfile() : null);

            System.out.println("\n" + AnsiColors.info("=== SIDE-BY-SIDE COMPARISON RESULT ==="));
            System.out.println(AnsiColors.success(comparisonEngine.compare(firstResult, secondResult)));
            System.out.println("\nDetailed Metric Comparison:");
            for (String difference : comparisonEngine.differences(firstResult, secondResult)) {
                System.out.println(" • " + difference);
            }
        } catch (Exception ex) {
            System.out.println(AnsiColors.danger("Comparison failed: " + ex.getMessage()));
        }
    }

    private void handleIngredientSearch() {
        try {
            System.out.print("Enter ingredient name or partial query: ");
            String query = scanner.nextLine().trim();
            List<Ingredient> matches = repository.search(query);
            if (matches.isEmpty()) {
                System.out.println(AnsiColors.warning("No matching ingredients found in database."));
                return;
            }
            System.out.println("\n" + AnsiColors.info("Matching Ingredients Found:"));
            for (Ingredient ingredient : matches) {
                System.out.println(" • " + AnsiColors.bold(ingredient.getName()) + " -> Category: " + ingredient.getCategory() + " | Note: " + ingredient.getNote());
            }
        } catch (DatasetLoadException ex) {
            System.out.println(AnsiColors.danger(ex.getMessage()));
        }
    }

    private void handleHistory() {
        try {
            User currentUser = authService.getCurrentUser();
            String username = currentUser != null ? currentUser.getUsername() : "guest";
            List<String> lines = historyService.loadHistoryLinesForUser(username);

            if (lines.isEmpty()) {
                System.out.println(AnsiColors.warning("No scan history found for user: " + username));
                return;
            }
            System.out.println("\n" + AnsiColors.info("=== SCAN HISTORY (" + username + ") ==="));
            for (String line : lines) {
                System.out.println(" • " + line);
            }
        } catch (IOException ex) {
            System.out.println(AnsiColors.danger("Unable to read history logs: " + ex.getMessage()));
        }
    }

    private void handleExport() {
        if (currentReport == null) {
            System.out.println(AnsiColors.warning("No active report loaded. Please analyze a label first."));
            return;
        }
        try {
            System.out.print("Select export format (.txt, .csv, .json): ");
            String extension = scanner.nextLine().trim().toLowerCase(Locale.ROOT);
            if (!extension.startsWith(".")) {
                extension = "." + extension;
            }
            Path path = reportService.exportReport(currentReport, extension);
            System.out.println(AnsiColors.success("Report successfully exported to: " + path.toAbsolutePath()));
        } catch (ReportExportException ex) {
            System.out.println(AnsiColors.danger(ex.getMessage()));
        }
    }

    private FoodLabel promptForLabel() throws InvalidLabelDataException {
        System.out.print("Product Name: ");
        String productName = scanner.nextLine().trim();
        System.out.print("Brand Name: ");
        String brand = scanner.nextLine().trim();
        System.out.print("Serving Size (e.g. 100g, 1 cup): ");
        String servingSize = scanner.nextLine().trim();

        System.out.print("Ingredients (comma-separated): ");
        String ingredientInput = scanner.nextLine().trim();
        List<String> ingredientNames = InputValidator.splitIngredients(ingredientInput);
        if (ingredientNames.isEmpty()) {
            ingredientNames = List.of("unknown ingredient");
        }

        System.out.print("Front-of-package Claims (comma-separated, e.g. No Added Sugar, High Protein, Low Fat): ");
        String claimsInput = scanner.nextLine().trim();
        List<Claim> claims = parseClaims(claimsInput);

        System.out.print("Calories: ");
        String caloriesInput = scanner.nextLine().trim();
        System.out.print("Fat (g): ");
        String fatInput = scanner.nextLine().trim();
        System.out.print("Sugar (g): ");
        String sugarInput = scanner.nextLine().trim();
        System.out.print("Sodium (mg): ");
        String sodiumInput = scanner.nextLine().trim();
        System.out.print("Protein (g): ");
        String proteinInput = scanner.nextLine().trim();
        System.out.print("Carbohydrates (g): ");
        String carbsInput = scanner.nextLine().trim();
        System.out.print("Dietary Fiber (g): ");
        String fiberInput = scanner.nextLine().trim();

        if (InputValidator.isBlank(productName) || InputValidator.isBlank(brand)) {
            throw new InvalidLabelDataException("Product name and brand are mandatory fields.");
        }

        double calories = parseDouble(caloriesInput, "Calories");
        double fat = parseDouble(fatInput, "Fat");
        double sugar = parseDouble(sugarInput, "Sugar");
        double sodium = parseDouble(sodiumInput, "Sodium");
        double protein = parseDouble(proteinInput, "Protein");
        double carbs = parseDouble(carbsInput, "Carbohydrates");
        double fiber = parseDouble(fiberInput, "Dietary Fiber");

        List<Ingredient> ingredients = new ArrayList<>();
        for (String name : ingredientNames) {
            ingredients.add(mapIngredient(name));
        }

        return new FoodLabel(productName, brand, servingSize, ingredients, claims, calories, fat, sugar, sodium, protein, carbs, fiber);
    }

    private List<Claim> parseClaims(String input) {
        List<Claim> claims = new ArrayList<>();
        if (InputValidator.isBlank(input)) {
            return claims;
        }
        for (String part : input.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isBlank()) {
                ClaimType type = mapClaimType(trimmed);
                claims.add(new Claim(type, trimmed));
            }
        }
        return claims;
    }

    private ClaimType mapClaimType(String text) {
        String normalized = text.toLowerCase(Locale.ROOT);
        if (normalized.contains("sugar")) return ClaimType.NO_ADDED_SUGAR;
        if (normalized.contains("fat")) return ClaimType.LOW_FAT;
        if (normalized.contains("protein")) return ClaimType.HIGH_PROTEIN;
        if (normalized.contains("natural")) return ClaimType.NATURAL;
        if (normalized.contains("organic")) return ClaimType.ORGANIC;
        return ClaimType.NON_GMO;
    }

    private Ingredient mapIngredient(String name) {
        String normalized = name.toLowerCase(Locale.ROOT);
        if (normalized.contains("artificial") || normalized.contains("flavor") || normalized.contains("color")) {
            return new Ingredient(name, IngredientCategory.ARTIFICIAL, "Artificial additive or coloring agent");
        }
        if (normalized.contains("sugar") || normalized.contains("syrup") || normalized.contains("sweetener") || normalized.contains("fructose")) {
            return new Ingredient(name, IngredientCategory.SWEETENER, "Refined sweetener / sugar derivative");
        }
        if (normalized.contains("preserv") || normalized.contains("benzoate") || normalized.contains("nitrate")) {
            return new Ingredient(name, IngredientCategory.PRESERVATIVE, "Chemical preservative agent");
        }
        if (normalized.contains("soy") || normalized.contains("corn") || normalized.contains("maltodextrin")) {
            return new Ingredient(name, IngredientCategory.GMO_DERIVED, "Potential GMO-derived crop product");
        }
        if (normalized.contains("milk") || normalized.contains("peanut") || normalized.contains("wheat") || normalized.contains("egg")) {
            return new Ingredient(name, IngredientCategory.ALLERGEN, "Recognized major food allergen");
        }
        return new Ingredient(name, IngredientCategory.NATURAL, "Whole or natural ingredient");
    }

    private double parseDouble(String value, String label) throws InvalidLabelDataException {
        if (InputValidator.isBlank(value) || !InputValidator.isDouble(value)) {
            throw new InvalidLabelDataException("Please provide a valid numeric value for " + label + ".");
        }
        return Double.parseDouble(value);
    }
}
