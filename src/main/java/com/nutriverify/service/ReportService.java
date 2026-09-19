package com.nutriverify.service;

import com.nutriverify.config.AppConfig;
import com.nutriverify.exception.ReportExportException;
import com.nutriverify.model.AnalysisResult;
import com.nutriverify.model.Report;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

/**
 * Service orchestrating report creation and multi-format file exports.
 */
public class ReportService {

    public Report createReport(AnalysisResult analysisResult) {
        return new Report(
                analysisResult.getLabel().getProductName(),
                analysisResult.getLabel().getBrand(),
                LocalDateTime.now(),
                analysisResult);
    }

    public Path exportReport(Report report, String extension) throws ReportExportException {
        Path directory = Paths.get(AppConfig.EXPORTS_DIRECTORY);
        try {
            Files.createDirectories(directory);
        } catch (IOException ex) {
            throw new ReportExportException("Unable to create export directory: " + ex.getMessage());
        }

        String ext = extension.startsWith(".") ? extension : "." + extension;
        String filename = sanitize(report.getProductName()) + "-" + System.currentTimeMillis() + ext;
        Path target = directory.resolve(filename);

        String content = switch (ext.toLowerCase()) {
            case ".csv" -> renderCsv(report);
            case ".json" -> renderJson(report);
            default -> renderText(report);
        };

        try {
            Files.writeString(target, content, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new ReportExportException("Unable to write export file: " + ex.getMessage());
        }
        return target;
    }

    private String renderText(Report report) {
        StringBuilder sb = new StringBuilder();
        sb.append("====================================================\n");
        sb.append("               NUTRIVERIFY AUDIT REPORT             \n");
        sb.append("====================================================\n");
        sb.append("Product Name   : ").append(report.getProductName()).append("\n");
        sb.append("Brand          : ").append(report.getBrand()).append("\n");
        sb.append("Generated At   : ").append(report.getGeneratedAt()).append("\n");
        sb.append("----------------------------------------------------\n");
        sb.append("Authenticity Score : ").append(report.getAnalysisResult().getAuthenticityScore()).append("/100\n");
        sb.append("Health Score       : ").append(report.getAnalysisResult().getHealthScore()).append("/100\n");
        sb.append("Risk Level         : ").append(report.getAnalysisResult().getRiskLevel()).append("\n");
        sb.append("----------------------------------------------------\n");
        sb.append("RECOMMENDATIONS & AUDIT FINDINGS:\n");
        for (String rec : report.getAnalysisResult().getRecommendations()) {
            sb.append(" - ").append(rec).append("\n");
        }
        sb.append("====================================================\n");
        return sb.toString();
    }

    private String renderCsv(Report report) {
        StringBuilder sb = new StringBuilder();
        sb.append("ProductName,Brand,GeneratedAt,AuthenticityScore,HealthScore,RiskLevel\n");
        sb.append(escapeCsv(report.getProductName())).append(",")
                .append(escapeCsv(report.getBrand())).append(",")
                .append(report.getGeneratedAt()).append(",")
                .append(report.getAnalysisResult().getAuthenticityScore()).append(",")
                .append(report.getAnalysisResult().getHealthScore()).append(",")
                .append(report.getAnalysisResult().getRiskLevel()).append("\n");
        return sb.toString();
    }

    private String renderJson(Report report) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"productName\": \"").append(escapeJson(report.getProductName())).append("\",\n");
        sb.append("  \"brand\": \"").append(escapeJson(report.getBrand())).append("\",\n");
        sb.append("  \"generatedAt\": \"").append(report.getGeneratedAt()).append("\",\n");
        sb.append("  \"authenticityScore\": ").append(report.getAnalysisResult().getAuthenticityScore()).append(",\n");
        sb.append("  \"healthScore\": ").append(report.getAnalysisResult().getHealthScore()).append(",\n");
        sb.append("  \"riskLevel\": \"").append(report.getAnalysisResult().getRiskLevel()).append("\"\n");
        sb.append("}\n");
        return sb.toString();
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        return "\"" + input.replace("\"", "\"\"") + "\"";
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String sanitize(String value) {
        return value.replaceAll("[^a-zA-Z0-9._-]", "-").toLowerCase();
    }
}
