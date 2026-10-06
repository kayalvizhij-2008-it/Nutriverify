package com.nutriverify.service.ocr;

import org.springframework.stereotype.Component;

/**
 * Router that selects ExternalOCRProvider when configured or ManualOCRProvider fallback.
 */
@Component
public class OCRProviderRouter {

    private final ExternalOCRProvider externalProvider;
    private final ManualOCRProvider manualProvider;

    public OCRProviderRouter(ExternalOCRProvider externalProvider, ManualOCRProvider manualProvider) {
        this.externalProvider = externalProvider;
        this.manualProvider = manualProvider;
    }

    public OCRResult processImage(byte[] imageBytes, String filename) {
        if (externalProvider.isConfigured()) {
            try {
                return externalProvider.processImage(imageBytes, filename);
            } catch (Exception e) {
                return manualProvider.processImage(imageBytes, filename);
            }
        }
        return manualProvider.processImage(imageBytes, filename);
    }

    public boolean isOcrConfigured() {
        return externalProvider.isConfigured();
    }
}
