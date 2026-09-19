# 🛡️ NutriVerify
### Full-Stack Nutrition Intelligence & Food Label Verification Platform

> **"Know What You're Eating. Verify What the Label Tells You."**

![Java](https://img.shields.io/badge/Java-17%2B-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-green?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![H2](https://img.shields.io/badge/H2-Database-purple?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-blue?style=for-the-badge&logo=tailwindcss)

---

## 📌 Overview

**NutriVerify** is a full-stack nutrition intelligence platform that analyzes food labels, verifies health claims, detects allergens, and provides personalized nutrition insights. Built with Java Spring Boot backend and React TypeScript frontend.

---

## ✨ Features

### 🧾 Product Analysis
- Manual nutrition entry with full facts (calories, fat, saturated fat, trans fat, sugar, added sugar, sodium, protein, carbs, fiber, cholesterol)
- Image/PDF upload (OCR provider-configurable, 10MB limit with MIME validation)
- Real-time analysis pipeline with insight generation
- Per-field confidence scores
- User correction workflow

### ⚠️ Allergen Detection (NEW)
- Automatic detection of 9 major allergen categories: Milk, Eggs, Peanuts, Tree Nuts, Soy, Wheat, Fish, Shellfish, Sesame
- Personal allergen profile matching
- Cautious, evidence-based language ("Potential Allergen" — never medical certainty)

### 🥗 Ingredient Intelligence
- Category classification (Natural, Artificial, Preservative, Sweetener, Allergen, Controversial, GMO-derived, Unknown)
- Per-ingredient risk level and plain-language explanation

### ✅ Claim Verification
- VERIFIED / FALSE / SUSPICIOUS verdicts with explanations
- Claims: High Protein, Low Fat, No Added Sugar, Natural, Organic, Non-GMO
- 6 dedicated claim rules with configurable thresholds

### 🧠 Health Scoring
- Deterministic 0-100 health score via `HealthScoreEngine`
- Positive factors (protein, fiber) and negative factors (sugar, sodium, fat)
- SVG score ring visualization on results page
- Risk classification (Trusted, Low Risk, Moderate Risk, High Risk, Critical Risk)

### 🔄 Nutrition Consistency
- Calories vs macronutrients cross-check (15% tolerance)
- Sugar vs carbs validation
- Sodium threshold monitoring

### 🔄 Product Comparison
- Side-by-side comparison across all nutrition metrics
- Recommended product with detailed reasoning

### 🤖 NutriSaathi (AI Assistant)
- Conversational nutrition assistant with 40+ response patterns
- General nutrition questions + product-specific context
- Conversation history, copy, regenerate, helpful/not-helpful feedback
- Selective context retrieval (only loads relevant product data)
- Multilingual responses (English, Hindi, Tamil)

### 🎙️ Voice Saathi
- Accessibility-first voice assistant using Web Speech API
- Browser-native STT/TTS — no API keys required for Chrome/Edge/Safari
- English, Hindi, Tamil language support
- Real-time interim transcript display

### 🌐 Multilingual (India-First)
- 3 fully translated languages: English, Tamil (தமிழ்), Hindi (हिन्दी)
- 130+ translation keys covering all UI elements
- Centralized i18n architecture — never hardcoded strings
- Language persists across sessions
- Architecture extensible to 11 Indian languages

### ♿ Accessibility Center
- High Contrast mode (real CSS application)
- Large Text mode
- Reduced Motion (respects `prefers-reduced-motion`)
- Enhanced Keyboard Navigation with visible focus states
- Screen Reader Optimization
- Simplified UI mode
- All preferences persisted in localStorage

### 📊 Dashboard
- Real data from backend (products analyzed, average health score, history entries, concerns)
- Beautiful empty state with call-to-action
- Quick actions for analyze, compare, and chat

### 📁 History & Saved Products
- Full CRUD with authenticated user isolation
- Search by product name or brand
- View, delete, export, re-analyze

### 📄 Reports
- Export as TXT, CSV, or JSON
- Includes all analysis data: nutrition, claims, ingredients, health score, recommendations

### 🎯 Nutrition Goals & Dietary Preferences
- Configurable goals: Lower Sugar, Lower Sodium, Higher Protein, Higher Fiber, Calorie Awareness
- Allergen profile: 11 common allergens
- Personalized recommendations based on goals

### 🔒 Security
- BCrypt password hashing
- JWT token authentication (stateless)
- Per-user data isolation
- File upload validation (size, MIME type, extension)
- Input sanitization, path traversal prevention
- CORS configuration
- Global exception handling (no stack traces exposed)
- API keys never reach the frontend

### 🎮 Demo Mode
- 3 pre-loaded sample products: Nature Valley, Tropicana, Maggi
- Deterministic analysis (same product → same scores)
- "Try Demo" button on landing page — no registration required
- All demo data clearly labeled

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.9+

### Backend
```bash
mvn spring-boot:run
```
Backend starts at `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts at `http://localhost:5173` (proxies to backend)

### Build
```bash
# Backend tests
mvn clean test

# Frontend build
cd frontend && npm run build
```

---

## 📂 Project Structure

```
NutriVerify/
├── src/main/java/com/nutriverify/
│   ├── NutriVerifyApplication.java      # Spring Boot entry point
│   ├── Main.java                         # Legacy CLI entry point (preserved)
│   ├── config/                           # AppConfig, CorsConfig, GlobalExceptionHandler
│   ├── controller/                       # 9 REST controllers
│   │   ├── AuthController.java
│   │   ├── AnalysisController.java       # With file upload validation
│   │   ├── HistoryController.java
│   │   ├── SavedProductController.java
│   │   ├── CompareController.java
│   │   ├── ChatController.java
│   │   ├── ProfileController.java
│   │   ├── VoiceController.java
│   │   └── HealthController.java
│   ├── data/                             # 4 Spring Data JPA repositories
│   ├── dto/                              # 10 DTOs with validation
│   ├── engine/                           # 8 analysis engines
│   │   ├── AuthenticityEngine.java
│   │   ├── AllergenDetector.java         # NEW: 9 allergen categories
│   │   ├── ClaimValidator.java
│   │   ├── ComparisonEngine.java
│   │   ├── HealthScoreEngine.java
│   │   ├── IngredientAnalyzer.java
│   │   ├── NutritionConsistencyChecker.java
│   │   ├── RecommendationEngine.java
│   │   └── rules/                        # 6 claim validation rules
│   ├── entity/                           # 4 JPA entities
│   ├── exception/                        # 4 custom exceptions
│   ├── model/                            # 15 domain models (preserved)
│   ├── repository/                       # Legacy file-based repos (preserved)
│   ├── security/                         # JWT auth: JwtTokenProvider, Filter, SecurityConfig
│   ├── service/                          # 8 services
│   ├── ui/                               # CLI UI components (preserved)
│   └── util/                             # Utilities
├── src/test/java/com/nutriverify/       # 91 JUnit 5 tests
│   ├── controller/                       # 10 integration tests
│   ├── engine/                           # 51 engine tests
│   ├── security/                         # 8 JWT tests
│   └── service/                          # 22 service tests
├── frontend/                             # React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── i18n/                         # EN/HI/TA translations (130+ keys)
│       ├── lib/                          # API client, auth context, demo data
│       ├── components/                   # Layout with sidebar nav
│       └── pages/                        # 19 functional pages
├── data/                                 # Legacy CSV data
├── .env.example                          # Environment variables template
└── pom.xml
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register user |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/logout` | No | Logout |
| GET | `/api/v1/health` | No | Health check |
| POST | `/api/v1/analyze` | Yes | Analyze product (full pipeline) |
| POST | `/api/v1/upload` | Yes | Upload label image |
| GET | `/api/v1/history` | Yes | Analysis history |
| GET | `/api/v1/history/{id}` | Yes | History detail |
| DELETE | `/api/v1/history/{id}` | Yes | Delete history |
| GET | `/api/v1/saved` | Yes | Saved products |
| POST | `/api/v1/saved` | Yes | Save product |
| DELETE | `/api/v1/saved/{id}` | Yes | Remove saved |
| POST | `/api/v1/compare` | Yes | Compare products |
| GET | `/api/v1/profile` | Yes | User profile |
| PUT | `/api/v1/profile` | Yes | Update profile |
| GET | `/api/v1/goals` | Yes | Nutrition goals |
| PUT | `/api/v1/goals` | Yes | Update goals |
| POST | `/api/v1/chat` | Yes | NutriSaathi chat |
| POST | `/api/v1/voice/transcribe` | Yes | Speech-to-text |
| POST | `/api/v1/voice/speak` | Yes | Text-to-speech |

---

## 🧪 Testing

```bash
# Backend tests (91 tests)
mvn clean test
# Expected: Tests run: 91, Failures: 0, Errors: 0

# Frontend build
cd frontend && npm run build
# Expected: Build succeeds
```

### Test Coverage

| Test Class | Tests | Coverage |
|-----------|-------|----------|
| AuthControllerTest | 10 | Register, login, duplicate, validation, auth, health |
| AllergenDetectorTest | 10 | 9 allergen categories, personal matching, edge cases |
| ClaimValidatorTest | 12 | All 6 claim types: verified, false, multiple claims |
| RecommendationEngineTest | 8 | Score tiers, goal conflicts, allergen warnings |
| NutritionConsistencyCheckerTest | 7 | Calorie consistency, sugar>carbs, sodium, multiple issues |
| JwtTokenProviderTest | 8 | Generate, validate, extract, invalid tokens |
| IngredientAnalyzerTest | 5 | Natural, artificial, preservative, counting |
| AuthenticityEngineTest | 5 | Full pipeline integration, user profiles |
| ComparisonEngineTest | 4 | Product A better, B better, tie, differences |
| HealthScoreEngineTest | 2 | Healthy product, high sugar penalty |
| NutriSaathiServiceTest | 18 | Greetings, nutrition Q&A, contextual, multilingual |
| AuthServiceTest | 2 | Registration, login, invalid password |

---

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NUTRIVERIFY_JWT_SECRET` | JWT secret key (32+ chars) | Production |
| `NUTRIVERIFY_CORS_ALLOWED_ORIGINS` | CORS origins | No (default: localhost:5173) |
| `AI_API_KEY` | AI provider API key | No (demo mode) |
| `VISION_API_KEY` | Vision provider API key | No (demo mode) |
| `OCR_API_KEY` | OCR provider API key | No (demo mode) |
| `SPEECH_API_KEY` | Speech-to-text API key | No (browser API) |
| `TTS_API_KEY` | Text-to-speech API key | No (browser API) |
| `DATABASE_URL` | PostgreSQL connection URL | No (H2 default) |

---

## 🏗️ Backend Architecture

```
Request → SecurityFilter → Controller → Service → Engine → Response
                              ↓
                         Repository → Database (H2/PostgreSQL)
```

### Core Engines (All Preserved from Original)
- **AuthenticityEngine** — Orchestrates all analysis, computes authenticity score
- **HealthScoreEngine** — Deterministic 0-100 from nutrition data
- **ClaimValidator** — Strategy pattern with 6 claim rules
- **AllergenDetector** — Keyword-based detection across 9 categories
- **IngredientAnalyzer** — Category-based risk profiling
- **NutritionConsistencyChecker** — Cross-validates nutrition facts
- **ComparisonEngine** — Side-by-side product comparison
- **RecommendationEngine** — Personalized dietary advisories

---

## 🎨 Frontend Architecture

```
App.tsx → BrowserRouter → AuthProvider → Routes
                                    ↓
                              Layout (sidebar + content)
                                    ↓
                              Pages (19 routes)
                                    ↓
                              API Client → Backend
```

### Design System
- **Palette**: Charcoal, Ivory, Green, Lime, Citrus, Amber, Coral
- **Typography**: Inter + Noto Sans + Noto Sans Devanagari + Noto Sans Tamil
- **Components**: Cards, score rings, badges, alerts, chat bubbles, voice controls

---

## 🔄 Existing Java Engines Preserved

All original business logic engines were preserved **unchanged**:
- `AuthenticityEngine.java` — Full analysis orchestration
- `HealthScoreEngine.java` — Deterministic health scoring
- `ClaimValidator.java` — Strategy pattern claim validation
- `ComparisonEngine.java` — Product comparison
- `NutritionConsistencyChecker.java` — Nutrition cross-checks
- `IngredientAnalyzer.java` — Ingredient risk profiling
- `RecommendationEngine.java` — Personalized advisories
- `ClaimRule.java` + 6 rules — NoAddedSugar, LowFat, HighProtein, Natural, Organic, NonGmo
- All 15 domain models in `model/` package
- CLI UI components in `ui/` package
- Legacy services in `service/` package

---

## 📊 Backend Startup

```bash
mvn spring-boot:run
# Starts at http://localhost:8080
# H2 Console at http://localhost:8080/h2-console
```

## 📊 Frontend Startup

```bash
cd frontend
npm install
npm run dev
# Starts at http://localhost:5173
# Proxies /api/* to http://localhost:8080
```

---

## ⚠️ Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| OCR/Vision | ⚠️ Configuration Required | Upload works but falls back to manual entry. OCR provider needs API key. |
| AI Provider | ⚠️ Rules-Based | NutriSaathi uses rules-based responses. External AI needs API key. |
| Voice Saathi | ✅ Browser API | Uses Web Speech API (Chrome/Edge/Safari). No API keys needed. |
| PDF Export | ✅ TXT/CSV/JSON | Full report export. PDF would require jsPDF library. |
| Multilingual | ✅ 3 Languages | English, Hindi, Tamil fully translated. 8 more languages architecture-ready. |
| Database | ✅ H2 | Development mode. PostgreSQL-ready architecture. |

---

## 🤝 Built By

**Kayalvizhi J** — Information Technology Student
Passionate about Java, AI-inspired systems, and building impactful solutions through clean architecture.

---

## 📄 License

MIT
