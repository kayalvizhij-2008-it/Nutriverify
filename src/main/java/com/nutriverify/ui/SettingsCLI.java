package com.nutriverify.ui;

import com.nutriverify.model.UserPreferences;
import com.nutriverify.service.SettingsService;
import com.nutriverify.util.AnsiColors;

import java.util.Scanner;

/**
 * Controller providing interactive CLI settings configuration.
 */
public class SettingsCLI {
    private final SettingsService settingsService;
    private final Scanner scanner;

    public SettingsCLI(SettingsService settingsService, Scanner scanner) {
        this.settingsService = settingsService;
        this.scanner = scanner;
    }

    public void showSettingsMenu() {
        while (true) {
            UserPreferences prefs = settingsService.getPreferences();
            System.out.println("\n" + AnsiColors.bold("=== NUTRIVERIFY CONFIGURATION & THRESHOLDS ==="));
            System.out.println("1. Low Fat Threshold (Current: " + prefs.getCustomLowFatThreshold() + "g)");
            System.out.println("2. High Protein Threshold (Current: " + prefs.getCustomHighProteinThreshold() + "g)");
            System.out.println("3. Max Daily Sugar Target (Current: " + prefs.getMaxDailySugarTarget() + "g)");
            System.out.println("4. Toggle ANSI Colors (Current: " + (prefs.isEnableAnsiColors() ? "ENABLED" : "DISABLED") + ")");
            System.out.println("5. Back to Main Dashboard");
            System.out.print(AnsiColors.cyan("Select option (1-5): "));

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> {
                    System.out.print("Enter new Low Fat threshold (g): ");
                    parseAndSet(() -> {}, val -> prefs.setCustomLowFatThreshold(val));
                }
                case "2" -> {
                    System.out.print("Enter new High Protein threshold (g): ");
                    parseAndSet(() -> {}, val -> prefs.setCustomHighProteinThreshold(val));
                }
                case "3" -> {
                    System.out.print("Enter new Max Sugar target (g): ");
                    parseAndSet(() -> {}, val -> prefs.setMaxDailySugarTarget(val));
                }
                case "4" -> {
                    prefs.setEnableAnsiColors(!prefs.isEnableAnsiColors());
                    settingsService.saveSettings(prefs);
                    System.out.println(AnsiColors.success("ANSI color mode toggled."));
                }
                case "5" -> {
                    return;
                }
                default -> System.out.println(AnsiColors.warning("Invalid choice. Please choose 1-5."));
            }
        }
    }

    private void parseAndSet(Runnable pre, java.util.function.DoubleConsumer setter) {
        String input = scanner.nextLine().trim();
        try {
            double val = Double.parseDouble(input);
            if (val < 0) {
                System.out.println(AnsiColors.danger("Value must be non-negative."));
                return;
            }
            setter.accept(val);
            settingsService.saveSettings(settingsService.getPreferences());
            System.out.println(AnsiColors.success("Setting updated and persisted successfully."));
        } catch (NumberFormatException e) {
            System.out.println(AnsiColors.danger("Invalid numeric entry. Setting unchanged."));
        }
    }
}
