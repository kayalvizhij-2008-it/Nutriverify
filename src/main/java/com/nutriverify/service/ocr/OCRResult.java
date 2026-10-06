package com.nutriverify.service.ocr;

import java.util.Map;

/**
 * Result DTO for OCR extraction with confidence and metadata.
 */
public class OCRResult {
    private final boolean ocrConfigured;
    private final boolean ocrAvailable;
    private final String provider;
    private final Double confidence;
    private final String status;
    private final String extractedText;
    private final Map<String, Object> extractedFields;
    private final String noticeMessage;

    public OCRResult(boolean ocrConfigured, boolean ocrAvailable, String provider,
                     Double confidence, String status, String extractedText,
                     Map<String, Object> extractedFields, String noticeMessage) {
        this.ocrConfigured = ocrConfigured;
        this.ocrAvailable = ocrAvailable;
        this.provider = provider;
        this.confidence = confidence;
        this.status = status;
        this.extractedText = extractedText;
        this.extractedFields = extractedFields;
        this.noticeMessage = noticeMessage;
    }

    public boolean isOcrConfigured() { return ocrConfigured; }
    public boolean isOcrAvailable() { return ocrAvailable; }
    public String getProvider() { return provider; }
    public Double getConfidence() { return confidence; }
    public String getStatus() { return status; }
    public String getExtractedText() { return extractedText; }
    public Map<String, Object> getExtractedFields() { return extractedFields; }
    public String getNoticeMessage() { return noticeMessage; }
}
