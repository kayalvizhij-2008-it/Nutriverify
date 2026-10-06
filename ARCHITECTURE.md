# 🛡️ NutriVerify — System Architecture & Technical Specification

## 1. High-Level Architecture Overview

NutriVerify is a multi-tier Food Label Verification and Nutrition Intelligence platform built with a Java Spring Boot 3.4 backend and React 19 TypeScript frontend.

```text
               ┌──────────────────────────────────────────────┐
               │    NutriVerify Frontend (React 19 + Vite)   │
               │   - Landing, Analyze Hub, Results Dossier   │
               │   - AI Status Center, Voice Assistant, i18n  │
               └──────────────────────┬───────────────────────┘
                                      │ REST API / JSON + Bearer JWT
               ┌──────────────────────▼───────────────────────┐
               │   NutriVerify Backend (Spring Boot 3.4)      │
               │   - Security Filter & JWT Provider           │
               │   - REST Controllers & Data Repositories     │
               └──────────┬────────────────────────┬──────────┘
                          │                        │
       ┌──────────────────▼──────┐      ┌──────────▼──────────────┐
       │ AI & Intelligence Layer │      │ OCR Extraction Layer    │
       │ - AIProviderRouter      │      │ - OCRProviderRouter     │
       │ - ExternalLLMProvider   │      │ - ExternalOCRProvider   │
       │ - Deterministic Fallback│      │ - ManualOCRProvider     │
       └─────────────────────────┘      └─────────────────────────┘
```

---

## 2. Capabilities Matrix

| Subsystem | Available Out-of-the-Box | Optional External Provider |
| :--- | :--- | :--- |
| **Health Scoring** | 100% Deterministic Engine (`HealthScoreEngine`) | None Required |
| **Allergen Matrix** | 9 Major Allergen Detector (`AllergenDetector`) | None Required |
| **Claim Verification** | 6 Statutory Rules Engine (`ClaimValidator`) | None Required |
| **AI Assistant** | Local Deterministic Domain Engine (`DeterministicNutriSaathiProvider`) | OpenAI / Anthropic / Gemini REST API (`ExternalLLMProvider`) |
| **OCR Extraction** | Manual Verification Workflow (`ManualOCRProvider`) | External Vision REST API (`ExternalOCRProvider`) |
| **Voice Assistant** | HTML5 Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) | None Required |

---

## 3. Backend Package Hierarchy

- `com.nutriverify.controller`: REST endpoints (`AuthController`, `AnalysisController`, `ChatController`, `AiStatusController`, `HistoryController`, `SavedProductController`, `CompareController`, `ReportController`, `ProfileController`, `GoalsController`)
- `com.nutriverify.service.ai`: `AIProviderRouter`, `ExternalLLMProvider`, `DeterministicNutriSaathiProvider`, `AIResult`
- `com.nutriverify.service.ocr`: `OCRProviderRouter`, `ExternalOCRProvider`, `ManualOCRProvider`, `OCRResult`
- `com.nutriverify.engine`: Verification engines (`HealthScoreEngine`, `AuthenticityEngine`, `ClaimValidator`, `AllergenDetector`, `IngredientAnalyzer`, `NutritionConsistencyChecker`, `ComparisonEngine`, `RecommendationEngine`)
- `com.nutriverify.security`: JWT filter, BCrypt encoder, stateless authentication rules
- `com.nutriverify.data` & `entity`: JPA repositories and persistent database entities

---

## 4. Environment Configuration

```properties
# Backend Properties (application.properties or environment)
nutriverify.jwt.secret=${NUTRIVERIFY_JWT_SECRET:super-secret-key-32-chars-long!}
nutriverify.ai.enabled=true
nutriverify.ai.provider=${AI_PROVIDER:openai}
nutriverify.ai.api-key=${AI_API_KEY:}
nutriverify.ai.model=${AI_MODEL:gpt-4o-mini}
nutriverify.ai.base-url=${AI_BASE_URL:https://api.openai.com/v1}
nutriverify.ai.timeout-ms=${AI_TIMEOUT_MS:10000}

# OCR & Vision
nutriverify.ocr.api-key=${OCR_API_KEY:${VISION_API_KEY:}}
```

---

## 5. Security & Secret Isolation Policy

- API keys and secrets are strictly scoped to the Spring Boot application container.
- Frontend React bundles, Vite environment variables, local storage, API responses, and logs never expose provider secrets.
- All protected endpoints require a valid HTTP `Authorization: Bearer <jwt-token>` header.
