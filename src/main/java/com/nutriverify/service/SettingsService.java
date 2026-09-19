package com.nutriverify.service;

import com.nutriverify.exception.NutriVerifyException;
import com.nutriverify.model.UserPreferences;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * Service responsible for persisting and loading application preferences.
 */
public class SettingsService {
    private static final String SETTINGS_FILE = "data/settings.properties";
    private UserPreferences currentPreferences;

    public SettingsService() {
        this.currentPreferences = loadSettings();
    }

    public UserPreferences getPreferences() {
        return currentPreferences;
    }

    public UserPreferences loadSettings() {
        Path path = Paths.get(SETTINGS_FILE);
        Properties props = new Properties();

        if (Files.exists(path)) {
            try (InputStream in = Files.newInputStream(path)) {
                props.load(in);
            } catch (Exception e) {
                // Fallback to default
            }
        }

        double lowFat = Double.parseDouble(props.getProperty("threshold.lowFat", "3.0"));
        double highProtein = Double.parseDouble(props.getProperty("threshold.highProtein", "10.0"));
        double maxSugar = Double.parseDouble(props.getProperty("threshold.maxSugar", "25.0"));
        boolean ansi = Boolean.parseBoolean(props.getProperty("ui.ansiColors", "true"));

        return new UserPreferences(lowFat, highProtein, maxSugar, ansi);
    }

    public void saveSettings(UserPreferences preferences) {
        this.currentPreferences = preferences;
        Path path = Paths.get(SETTINGS_FILE);
        try {
            if (path.getParent() != null && !Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }
            Properties props = new Properties();
            props.setProperty("threshold.lowFat", String.valueOf(preferences.getCustomLowFatThreshold()));
            props.setProperty("threshold.highProtein", String.valueOf(preferences.getCustomHighProteinThreshold()));
            props.setProperty("threshold.maxSugar", String.valueOf(preferences.getMaxDailySugarTarget()));
            props.setProperty("ui.ansiColors", String.valueOf(preferences.isEnableAnsiColors()));

            try (OutputStream out = Files.newOutputStream(path)) {
                props.store(out, "NutriVerify Configuration Settings");
            }
        } catch (Exception e) {
            throw new NutriVerifyException("Failed to save settings: " + e.getMessage(), e);
        }
    }
}
