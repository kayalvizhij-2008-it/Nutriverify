package com.nutriverify.service.ocr;

import org.springframework.stereotype.Component;
import java.util.Collections;

/**
 * Manual OCR Provider fallback when automatic OCR services are unconfigured.
 */
@Component
public class ManualOCRProvider implements OCRProvider {

    @Override
    public OCRResult processImage(byte[] imageBytes, String filename) {
        return new OCRResult(
                false,
                false,
                "manual-verification",
                0.0,
                "manual-verification-required",
                "",
                Collections.emptyMap(),
                "Automatic OCR is not configured. You can verify the extracted fields manually."
        );
    }

    @Override
    public boolean isConfigured() {
        return false;
    }

    @Override
    public String getProviderName() {
        return "ManualOCRProvider";
    }
}
