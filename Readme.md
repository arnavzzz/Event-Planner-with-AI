# 🎉 Event Planner with AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

An intelligent, next-generation **Event Management & Operations Platform** powered by AI. Designed to streamline every phase of event planning—from initial AI-assisted drafting and vendor negotiation to real-time live control room operations on the day of the event.

---

## ✨ Features & Capabilities

### 🔐 Multi-Role Access Control
* **Event Organizer**: Full dashboard access to plan, monitor, and execute events.
* **Vendor**: Manage service offerings, contracts, and logistics.
* **Admin**: Platform-wide system management, analytics, and user governance.

### 🤖 AI-Powered Suite
* **AI Event Planner**: Automated event schedule generation, budget estimation, and itinerary recommendations.
* **Autonomous AI Agents**: Specialized AI agents for risk management, budget optimization, logistics planning, and guest engagement.
* **AI Insights & Event Health Score**: Real-time diagnostic health scoring to identify potential risks before they happen.

### 📅 End-to-End Event Operations
* **Overview & Analytics**: Unified dashboard with key performance metrics, health scores, and quick action cards.
* **Events & Venue Management**: Track multiple active events and evaluate candidate venues.
* **Vendor Management & Catering**: Coordinate vendor logistics, contracts, menus, and dietary requirements.
* **Financial Planning & Budgeting**: Detailed budget breakdowns, expense tracking, and cost projections.
* **Guest & Staff Management**: RSVP tracking, seating arrangements, staff rosters, and shift scheduling.
* **Live Control Room**: Real-time event execution monitoring, live issue reporting, and minute-by-minute schedules.
* **Risk Assessment & Mitigation**: Risk matrix scoring, automated contingency alerts, and safety checks.
* **Communication Hub & Documents**: Centralized messaging platform and unified document repository.
* **Dark / Light Mode**: Seamless dynamic theme switching across all dashboard views.

---

## 🔑 Demo Credentials

Test the application instantly using pre-configured demo credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| 👑 **Event Organizer** | `eo1@arnav.com` | `123456` |
| 🤝 **Vendor** | `ve1@arnav.com` | `654321` |
| 🛡️ **Admin** | `ad1@arnav.com` | `135246` |

---

## 🛠️ Tech Stack

* **Frontend Library**: [React 19](https://react.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/)
* **Linter**: [Oxlint](https://oxc.rs/docs/guide/usage/linter)

---

## 📁 Project Structure

```text
event_planner/
├── LICENSE.txt                     # Project License (MIT)
├── Readme.md                       # Main project documentation
└── frontend/                       # Frontend application root
    ├── public/                     # Static public assets
    ├── src/                        # Source files
    │   ├── App.tsx                 # Main application component & role routing
    │   ├── main.tsx                # Entry point
    │   ├── auth/                   # Authentication logic & demo accounts
    │   │   └── credentials.ts
    │   ├── assets/                 # Icons, images, and branding assets
    │   └── parts/                  # UI components and dashboard modules
    │       ├── LoginPage.tsx       # Auth login interface & dark mode toggle
    │       ├── login_page_components/
    │       └── dashboard/          # Dashboards for each role
    │           ├── Admin/          # System Admin Dashboard
    │           ├── Vendor/         # Vendor Operations Dashboard
    │           └── EventOrganizer/ # Event Organizer Dashboard & 20+ feature pages
    ├── package.json                # Dependencies and scripts
    ├── tsconfig.json               # TypeScript configuration
    └── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.0 or later recommended)
* `npm` or `pnpm` or `yarn`

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/arnavzzz/Event-Planner-with-AI.git
   cd Event-Planner-with-AI/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` (or the local URL printed in your terminal) to view the application.

---

## 📜 Available Scripts

Inside the `frontend` directory, you can run:

* `npm run dev`: Launches the development server with HMR.
* `npm run build`: Type-checks TypeScript files and builds the production bundle into `dist`.
* `npm run preview`: Locally previews the production build.
* `npm run lint`: Runs [Oxlint](https://oxc.rs) to inspect code quality and enforce standards.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

---

## 👨‍💻 Author

Developed by **Arnav Agrawal** (`arnavzzz`).
