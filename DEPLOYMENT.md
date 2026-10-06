# 🚀 NutriVerify — Production Deployment & Live Hosting Guide

This guide details the complete production architecture, deployment workflows, and environment configuration for running NutriVerify live in production.

---

## 🏗️ 1. Production Architecture Overview

```text
                                  INTERNET (HTTPS)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       ┌────────────────────────┐                 ┌────────────────────────┐
       │   FRONTEND STATIC      │                 │    BACKEND SERVICE     │
       │   React 19 + Vite      │ ──── HTTPS ───▶ │   Spring Boot (Java 17)│
       │   (Vercel/Render/Nginx)│                 │   (Render/Docker/VPS)  │
       └────────────────────────┘                 └───────────┬────────────┘
                                                              │
                                          ┌───────────────────┼───────────────────┐
                                          ▼                   ▼                   ▼
                                ┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
                                │ POSTGRESQL (PROD) │ │ HYBRID AI/OCR │ │ SPEECH / VOICE    │
                                │ Managed Cloud DB  │ │ OpenAI / Fall-│ │ Web Speech API &  │
                                │ (Neon/Supabase/   │ │ back Hybrid   │ │ Provider Routing  │
                                │  Render Postgres) │ │ Engine        │ │                   │
                                └───────────────────┘ └───────────────┘ └───────────────────┘
```

---

## 📋 2. Environment Variables Specification

### Frontend (`frontend/.env.production` / Cloud Dashboard)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public HTTPS backend URL | `https://nutriverify-backend.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (Optional) | `123456789-abc.apps.googleusercontent.com` |

### Backend (`.env` / Cloud Environment Variables)
| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Server port (default: 8080) | `8080` |
| `SPRING_PROFILES_ACTIVE` | Yes | Active Spring profile | `prod` |
| `DATABASE_URL` | Yes | PostgreSQL JDBC Connection URL | `jdbc:postgresql://ep-xyz.neon.tech/nutriverify?sslmode=require` |
| `DATABASE_USERNAME` | Yes | PostgreSQL user | `nutriverify_admin` |
| `DATABASE_PASSWORD` | Yes | PostgreSQL password | `super_secure_db_password` |
| `JWT_SECRET` | Yes | 32+ character HMAC key | `a-secure-32-char-random-production-key-here` |
| `NUTRIVERIFY_CORS_ALLOWED_ORIGINS` | Yes | Allowed frontend domains | `https://nutriverify.vercel.app,https://nutriverify.onrender.com` |
| `AI_ENABLED` | No | Enables AI assistant routing | `true` |
| `AI_PROVIDER` | No | Provider type (`openai`, `anthropic`) | `openai` |
| `AI_API_KEY` | No | OpenAI or Anthropic API Key | `sk-proj-...` |
| `AI_MODEL` | No | Model name | `gpt-4o-mini` |
| `OCR_API_KEY` | No | OCR provider key | `sk-...` |

---

## ☁️ 3. One-Click Cloud Deployment (Render Blueprint)

NutriVerify includes a pre-configured [`render.yaml`](./render.yaml) specification:

1. Push this repository to GitHub / GitLab.
2. Log into [Render](https://render.com) and click **New > Blueprint**.
3. Select your repository:
   - Render automatically provisions **PostgreSQL Database** (`nutriverify-db`).
   - Render builds and deploys **Spring Boot Backend** (`nutriverify-backend`) via `Dockerfile`.
   - Render builds and deploys **React Static Frontend** (`nutriverify-frontend`) with SPA rewrite rules.
4. Add your optional API keys (`AI_API_KEY`, `OCR_API_KEY`) in the Render Dashboard under **Environment**.

---

## 🐳 4. Unified Docker / VPS Deployment

To deploy on any Linux VPS (Ubuntu / Debian / AWS EC2 / DigitalOcean Droplet):

```bash
# 1. Clone repository
git clone https://github.com/your-org/NutriVerify.git
cd NutriVerify

# 2. Copy and customize production environment
cp .env.example .env
nano .env

# 3. Build and launch all containers (PostgreSQL + Backend + Frontend Nginx)
docker compose up -d --build

# 4. Check container status
docker compose ps
docker compose logs -f
```

---

## ⚡ 5. Verification Checklist

- [x] **Backend Health Check**: `curl -s https://<backend-url>/api/v1/health` returns `{"status":"UP", ...}`
- [x] **AI Subsystem Check**: `curl -s https://<backend-url>/api/v1/ai/status` returns operational status
- [x] **Cross-Origin Requests (CORS)**: Preflight `OPTIONS` headers pass for configured domains
- [x] **Database Schema**: Hibernate auto-migrates tables (`users`, `analysis_history`, `saved_products`, `uploaded_documents`)
- [x] **HTTPS Camera Access**: WebRTC camera scanner (`navigator.mediaDevices.getUserMedia`) functions securely over HTTPS
- [x] **JWT Authentication**: Registration, token issue, and protected endpoints operational
- [x] **Static SPA Routing**: Deep routes (e.g. `/results`, `/nutrisaathi`, `/history`) resolve cleanly to `index.html` without 404 errors
