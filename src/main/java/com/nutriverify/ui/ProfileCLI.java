package com.nutriverify.ui;

import com.nutriverify.model.User;
import com.nutriverify.model.UserProfile;
import com.nutriverify.service.AuthService;
import com.nutriverify.util.AnsiColors;

import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

/**
 * Controller handling user profile viewing and dietary preference customization.
 */
public class ProfileCLI {
    private final AuthService authService;
    private final Scanner scanner;

    public ProfileCLI(AuthService authService, Scanner scanner) {
        this.authService = authService;
        this.scanner = scanner;
    }

    public void showProfileMenu() {
        User user = authService.getCurrentUser();
        if (user == null) {
            System.out.println(AnsiColors.warning("No active session. Please log in first."));
            return;
        }

        UserProfile profile = user.getProfile();
        while (true) {
            System.out.println("\n" + AnsiColors.bold("=== USER PROFILE & DIETARY PREFERENCES ==="));
            System.out.println(AnsiColors.cyan("Username      : ") + user.getUsername());
            System.out.println(AnsiColors.cyan("Full Name     : ") + profile.getFullName());
            System.out.println(AnsiColors.cyan("Total Scans   : ") + profile.getTotalScansPerformed());
            System.out.println(AnsiColors.cyan("Dietary Goals : ") + (profile.getDietaryGoals().isEmpty() ? "None specified" : String.join(", ", profile.getDietaryGoals())));
            System.out.println(AnsiColors.cyan("Allergens     : ") + (profile.getAllergens().isEmpty() ? "None specified" : String.join(", ", profile.getAllergens())));
            System.out.println("\n1. Update Full Name");
            System.out.println("2. Set Dietary Goals (comma-separated, e.g. Low Sugar, High Protein)");
            System.out.println("3. Set Known Allergens (comma-separated, e.g. peanuts, milk, soy)");
            System.out.println("4. Back to Main Dashboard");
            System.out.print(AnsiColors.cyan("Select option (1-4): "));

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> {
                    System.out.print("Enter new Full Name: ");
                    String name = scanner.nextLine().trim();
                    if (!name.isBlank()) {
                        profile.setFullName(name);
                        authService.updateUserProfile(profile);
                        System.out.println(AnsiColors.success("Full name updated successfully."));
                    }
                }
                case "2" -> {
                    System.out.print("Enter dietary goals: ");
                    String goalsStr = scanner.nextLine().trim();
                    List<String> goals = Arrays.stream(goalsStr.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .toList();
                    profile.setDietaryGoals(goals);
                    authService.updateUserProfile(profile);
                    System.out.println(AnsiColors.success("Dietary goals updated successfully."));
                }
                case "3" -> {
                    System.out.print("Enter known allergens: ");
                    String allergensStr = scanner.nextLine().trim();
                    List<String> allergens = Arrays.stream(allergensStr.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .toList();
                    profile.setAllergens(allergens);
                    authService.updateUserProfile(profile);
                    System.out.println(AnsiColors.success("Allergen profile updated successfully."));
                }
                case "4" -> {
                    return;
                }
                default -> System.out.println(AnsiColors.warning("Invalid choice. Please enter 1-4."));
            }
        }
    }
}
