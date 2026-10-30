# 🎉 Event Planner with AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Live_Demo-00C7B7?logo=netlify&logoColor=white)](https://eventmindai1.netlify.app/)

An intelligent, full-stack **Event Management & Operations Platform** powered by Machine Learning and AI. Designed to streamline every phase of event execution—from AI-driven budget distribution, intelligent vendor matchmaking, and automated price negotiation, to live control room execution and post-event analytics.

> 🌐 **Live Application (Netlify)**: [https://eventmindai1.netlify.app/](https://eventmindai1.netlify.app/)  
> Explore the live interactive application directly in your browser!

---

## 🌟 Key Features & Capabilities

### 🤖 Machine Learning & AI Suite
* **Multi-Output Budget Prediction**: Machine learning regression model predicts optimal dollar distribution across 7 core event categories (`Venue`, `Catering`, `Photography & Videography`, `Decor & Floral`, `Audio/Visual`, `Entertainment/DJ`, `Staffing & Security`) with zero-drift budget sum normalization.
* **Knapsack Bundle Optimizer**: Combinatorial optimizer matching capacity, supported event types, and ratings to curate 3 distinct packages:
  * 🌟 **AI Balanced Recommendation**: Maximizes overall composite match score within budget.
  * 💰 **Budget Saver**: Lowest total cost while maintaining quality standards ($\ge 4.2$ rating).
  * 👑 **Premium Experience**: Highest-rated luxury vendors within allowable budget.
* **Budget Sufficiency & Deficit Diagnostics**: Evaluates minimum required budget thresholds for guest counts, alerting organizers with exact deficit values if budgets are insufficient.
* **Automated AI Price Negotiation**: Alternating-offer bargaining engine allowing organizers to negotiate pricing with individual vendors or full bundles. Leverages concession toggles (flexible dates, early deposits) to calculate counteroffers, project savings, and draft negotiation pitches.
* **Autonomous AI Agents & Health Scores**: Live diagnostics, risk scoring, and automated contingency alerts.
* **Zero-Setup Netlify Offline Simulation**: If deployed to Netlify without a running backend server, the client seamlessly falls back to a high-fidelity browser AI simulation so all packages, sliders, and negotiations work immediately.

### 💼 Event Organizer Dashboard
* **Event Organizer Dashboard**:
  * Unified overview with health scores, KPI metrics, and budget analytics.
  * Interactive **Create Event** wizard with live AI vendor recommendations, dynamic budget sliders, and price negotiation modals.
  * Comprehensive event operations: Venues, Catering, Budgets, Guests (RSVP & seating), Staff scheduling, and Risk Matrix.
  * **Live Control Room**: Real-time event day execution monitoring, live issue reporting, and minute-by-minute schedules.
  * **Global Currency Switcher**: Real-time conversion across USD ($), EUR (€), GBP (£), INR (₹), CAD ($), AUD ($), and JPY (¥).
### 🎨 Modern UI / UX
* Built with **React 19**, **TypeScript**, and modular **CSS Modules**.
* **Dynamic Theme Switcher**: Seamless Dark Mode and Light Mode support across all pages.
* Interactive modals, data tables, filterable views, and responsive design.

---

## 🔑 Demo Credentials

Test the application instantly on the <a href="https://eventmindai1.netlify.app/"
   target="eventmind_demo"
   rel="noopener noreferrer">
  🚀 Test EventMind AI Live
</a>  using pre-configured demo accounts:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Event Organizer** | `eo1@arnav.com` | `123456` | Full event creation, AI tools, live control room & analytics |

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19.2, TypeScript 6.0, Vite 8.3, CSS Modules, Lucide React Icons |
| **Backend API** | FastAPI 0.115+, Uvicorn (ASGI), Pydantic v2, CORS Middleware |
| **AI / Machine Learning** | Scikit-Learn 1.5+, Pandas, NumPy, Joblib, SciPy, Jupyter Notebook |
| **Deployment & Hosting** | Netlify (Pre-configured via `netlify.toml` and `_redirects`), Vite Proxy |
| **Tooling & Quality** | Oxlint, Python virtual environments (`.venv`), PowerShell / Batch scripts |

---

## 📁 Project Structure

```text
event_planner/
├── netlify.toml                    # Netlify production deployment configuration (root)
├── package.json                    # Root build orchestration script for Netlify CI/CD
├── start_services.bat              # One-click Windows Batch startup script
├── start_services.ps1              # One-click PowerShell startup script
├── LICENSE.txt                     # MIT License
├── Readme.md                       # Main project documentation
│
├── aiml-integration/               # Machine Learning & AI Recommendation Service
│   ├── data/                       # Vendor catalog (CSV & JSON databases)
│   ├── models/                     # Trained ML pipelines (.joblib artifacts)
│   │   ├── budget_allocator_pipeline.joblib
│   │   ├── vendor_catalog.joblib
│   │   └── vendor_recommender_engine.joblib
│   ├── notebook/                   # Model training and experimentation notebooks
│   ├── recommender.py              # Core ML regressor, optimizer & negotiation engine
│   ├── requirements.txt            # Python dependencies for ML pipeline
│   └── README.md                   # AIML-specific architecture documentation
│
├── backend/                        # FastAPI REST API Backend
│   ├── main.py                     # API application, route handlers & ML integration
│   ├── requirements.txt            # Backend Python dependencies
│   ├── test_api.py                 # Automated API test suite
│   └── test_main.http              # HTTP request inspection file
│
└── frontend/                       # Vite + React 19 + TypeScript Application
    ├── netlify.toml                # Netlify config for subdirectory base setup
    ├── .env.example                # Example environment variables (VITE_API_URL)
    ├── package.json                # Frontend dependencies and scripts
    ├── vite.config.ts              # Vite configuration (includes /api dev proxy)
    ├── public/
    │   ├── _redirects              # Netlify SPA client-side routing fallback
    │   └── favicon/                # Application logos and favicons
    └── src/
        ├── api/
        │   └── aiService.ts        # Typed API client + resilient offline AI fallback
        ├── auth/                   # Authentication logic & credentials
        ├── parts/
        │   ├── LoginPage.tsx       # Authentication interface
        │   └── dashboard/
        │       └── EventOrganizer/ # Event planning and operations pages
        │           ├── currency.ts # Global multi-currency formatting & conversion
        │           └── pages/
        ├── styles/                 # Scoped CSS modules & theme styles
        ├── App.tsx                 # Root application component
        └── main.tsx                # Application entry point
```

---

## 🌐 Deploying to Netlify

The application is deployed and live on Netlify:
* 🔗 **Live Application URL**: [https://eventmindai1.netlify.app/](https://eventmindai1.netlify.app/)

The repository is pre-configured with continuous deployment using [`netlify.toml`](netlify.toml) and [`_redirects`](frontend/public/_redirects).

### Step 1: Connect Your Repository to Netlify
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Choose **GitHub** and select your repository (`arnavzzz/Event-Planner-with-AI`).

### Step 2: Build & Directory Settings
Netlify will automatically detect the settings from [`netlify.toml`](netlify.toml):
* **Base directory**: `frontend`
* **Build command**: `npm run build`
* **Publish directory**: `frontend/dist` (or `dist` if base is set to `frontend`)

*(If prompted manually, you can also leave the Base directory empty and let the root `package.json` run `npm run build`).*

### Step 3: (Optional) Connect a Deployed FastAPI Backend
* If you host your Python FastAPI backend (e.g., on [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), or [Hugging Face Spaces](https://huggingface.co/spaces)):
  1. Go to your Netlify site &rarr; **Site configuration** &rarr; **Environment variables**.
  2. Add a new variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://your-event-planner-backend.onrender.com` (your live backend URL).
  3. Trigger a redeploy.

> [!NOTE]
> **Zero Backend Setup Required for UI Demos**: If `VITE_API_URL` is omitted, the frontend automatically activates an **intelligent client-side AI simulation mode** directly in the browser! All budget allocations, 3 package tiers, budget sufficiency warnings, and interactive AI price negotiations will function smoothly.

### Step 4: Click "Deploy Site"
Netlify will build the production bundle and assign a public `*.netlify.app` URL. Single-page navigation (`/login`, `/dashboard`, etc.) works seamlessly via [`_redirects`](frontend/public/_redirects).

---

## ⚡ Quick Start (Local Development)

### Option 1: One-Click Startup (Recommended for Windows)

Launch both the **FastAPI Backend** and the **Vite React Frontend** concurrently with one click:

* **Using Windows Command Prompt / Double-click**:
  ```cmd
  start_services.bat
  ```
* **Using PowerShell**:
  ```powershell
  .\start_services.ps1
  ```

Once started:
* 🌐 **React Frontend**: [http://localhost:5173](http://localhost:5173)
* 📖 **FastAPI Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Option 2: Manual Step-by-Step Setup

#### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.0 or later recommended) & `npm`
* [Python 3.11+](https://www.python.org/) with `pip`

#### 2. Backend Setup (FastAPI & ML Engine)
```bash
# Navigate to the project root
cd event_planner

# Create and activate a Python virtual environment
python -m venv backend/.venv

# Windows activation:
.\backend\.venv\Scripts\activate
# macOS/Linux activation:
# source backend/.venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server on port 8000
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Frontend Setup (React & Vite)
```bash
# Open a new terminal window and navigate to the frontend directory
cd event_planner/frontend

# Install dependencies
npm install

# Start Vite development server on port 5173
npm run dev
```

---

## 🧪 Testing the API & AI Integration

The backend includes a comprehensive automated test suite covering health checks, ML model loading, vendor recommendations, price negotiation, budget deficits, and event creation:

```bash
# Run with the backend virtual environment:
.\backend\.venv\Scripts\python.exe backend/test_api.py
```

Expected output:
```text
[AIML Service] Successfully loaded AI Engine from vendor_recommender_engine.joblib
[AIML Service] Loaded 45 vendors from catalog.
============================================================
Running FastAPI + AIML Integration Test Suite
============================================================
PASS: GET /
PASS: GET /api/health
PASS: GET /api/ai/metadata
PASS: POST /api/ai/recommend-vendors
PASS: POST /api/ai/predict-budget
PASS: GET /api/vendors?category=Catering
PASS: POST /api/events/create-with-ai
PASS: POST /api/ai/negotiate-vendor-price
PASS: POST /api/ai/negotiate-bundle
PASS: Insufficient budget warning detected on /api/ai/recommend-vendors
============================================================
ALL TESTS PASSED SUCCESSFULLY! AIML & BACKEND ARE FULLY CONNECTED.
============================================================
```

---

## 📡 REST API Reference

The FastAPI backend exposes the following endpoints (interactive Swagger documentation available at `/docs`):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root status and service health check |
| `GET` | `/api/health` | Diagnostic status of ML model readiness & catalog size |
| `GET` | `/api/ai/metadata` | Supported event types, categories, and bundle definitions |
| `POST` | `/api/ai/recommend-vendors` | Primary AI endpoint: predicts budget split & outputs 3 vendor bundles |
| `POST` | `/api/ai/predict-budget` | Computes proportional ML budget distribution across 7 categories |
| `POST` | `/api/ai/negotiate-vendor-price` | AI alternating-offer bargaining for an individual vendor |
| `POST` | `/api/ai/negotiate-bundle` | AI bundle-level price negotiation across all vendors |
| `GET` | `/api/vendors` | Searchable vendor catalog with category/tier/event filters |
| `POST` | `/api/events/create-with-ai` | Validates budget, generates AI bundle, and creates event |

---

## 📜 Available Frontend Scripts

Inside the `frontend` directory, you can run:

* `npm run dev`: Launches the Vite development server with Hot Module Replacement (HMR).
* `npm run build`: Type-checks TypeScript code and creates an optimized production bundle in `dist/`.
* `npm run preview`: Previews the production build locally.
* `npm run lint`: Runs [Oxlint](https://oxc.rs) to enforce code quality standards.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

---

## 👨‍💻 Author

Developed by **Arnav Agrawal** ([@arnavzzz](https://github.com/arnavzzz)).
