package com.nutriverify.service;

import com.nutriverify.config.AppConfig;
import com.nutriverify.model.Report;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service managing user-scoped scan history persistence.
 */
public class HistoryService {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void save(Report report, String username) throws IOException {
        Path path = Paths.get(AppConfig.HISTORY_PATH);
        if (path.getParent() != null) {
            Files.createDirectories(path.getParent());
        }

        String userTag = (username != null && !username.isBlank()) ? username.trim() : "anonymous";
        String line = String.join(";",
                userTag,
                report.getProductName(),
                report.getBrand(),
                report.getGeneratedAt().format(FORMATTER),
                String.valueOf(report.getAnalysisResult().getAuthenticityScore()),
                String.valueOf(report.getAnalysisResult().getHealthScore()),
                report.getAnalysisResult().getRiskLevel().name()
        ) + System.lineSeparator();

        Files.writeString(path, line, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    public List<String> loadHistoryLinesForUser(String username) throws IOException {
        Path path = Paths.get(AppConfig.HISTORY_PATH);
        if (!Files.exists(path)) {
            return new ArrayList<>();
        }

        List<String> results = new ArrayList<>();
        String targetUser = (username != null && !username.isBlank()) ? username.trim() : "anonymous";

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] parts = line.split(";", -1);
                if (parts.length >= 7 && parts[0].equalsIgnoreCase(targetUser)) {
                    String formatted = String.format("[%s] Product: %s | Brand: %s | Auth Score: %s | Health Score: %s | Risk: %s",
                            parts[3], parts[1], parts[2], parts[4], parts[5], parts[6]);
                    results.add(formatted);
                } else if (parts.length < 7 && line.contains(",")) {
                    // Backward compatibility with legacy history format
                    results.add(line);
                }
            }
        }
        return results;
    }
}
