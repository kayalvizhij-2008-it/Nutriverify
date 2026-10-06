package com.nutriverify.service.ocr;

/**
 * OCR Provider interface for food-label text and nutrition data extraction.
 */
public interface OCRProvider {
    OCRResult processImage(byte[] imageBytes, String filename);
    boolean isConfigured();
    String getProviderName();
}
