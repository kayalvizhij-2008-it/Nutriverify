package com.nutriverify.ui;

import com.nutriverify.exception.NutriVerifyException;
import com.nutriverify.service.AuthService;
import com.nutriverify.util.AnsiColors;

import java.util.Scanner;

/**
 * Console controller handling user registration and authentication UI interactions.
 */
public class AuthCLI {
    private final AuthService authService;
    private final ConsoleRenderer renderer;
    private final Scanner scanner;

    public AuthCLI(AuthService authService, ConsoleRenderer renderer, Scanner scanner) {
        this.authService = authService;
        this.renderer = renderer;
        this.scanner = scanner;
    }

    public boolean showAuthMenu() {
        while (!authService.isAuthenticated()) {
            System.out.println("\n" + AnsiColors.bold("=== NUTRIVERIFY ACCESS PORTAL ==="));
            System.out.println("1. Login");
            System.out.println("2. Register New Account");
            System.out.println("3. Exit Application");
            System.out.print(AnsiColors.cyan("Select option (1-3): "));

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> handleLogin();
                case "2" -> handleRegister();
                case "3" -> {
                    System.out.println(AnsiColors.info("Exiting NutriVerify. Goodbye!"));
                    return false;
                }
                default -> System.out.println(AnsiColors.warning("Invalid choice. Please enter 1, 2, or 3."));
            }
        }
        return true;
    }

    private void handleLogin() {
        System.out.println("\n" + AnsiColors.bold("--- LOGIN ---"));
        System.out.print("Username: ");
        String username = scanner.nextLine().trim();
        System.out.print("Password: ");
        String password = scanner.nextLine().trim();

        try {
            authService.login(username, password);
            renderer.printProgressBar(100);
            System.out.println(AnsiColors.success("\nWelcome back, " + authService.getCurrentUser().getProfile().getFullName() + "!"));
        } catch (NutriVerifyException ex) {
            System.out.println(AnsiColors.danger("Login Failed: " + ex.getMessage()));
        }
    }

    private void handleRegister() {
        System.out.println("\n" + AnsiColors.bold("--- CREATE AN ACCOUNT ---"));
        System.out.print("Desired Username: ");
        String username = scanner.nextLine().trim();
        System.out.print("Full Name: ");
        String fullName = scanner.nextLine().trim();
        System.out.print("Password: ");
        String password = scanner.nextLine().trim();

        try {
            authService.register(username, password, fullName);
            renderer.printProgressBar(100);
            System.out.println(AnsiColors.success("\nAccount registered successfully! Logged in as " + username + "."));
        } catch (NutriVerifyException ex) {
            System.out.println(AnsiColors.danger("Registration Failed: " + ex.getMessage()));
        }
    }
}
