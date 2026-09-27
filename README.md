<div align="center">

# 💼 JustTry FinTech CRM & Advisory Platform

**A Modern, Multi-Tier Financial CRM, Wealth Advisory, and KYC Underwriting Engine.**  
*Built for Retail Loans, Mutual Fund SIPs, and Insurance Origination.*

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Architecture](https://img.shields.io/badge/Storage-100%25%20Offline%20LocalStorage-success?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

[Live Landing Page](http://localhost:9001) • [Interactive Tour Guide](#-interactive-onboarding-tour) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Workspaces & RBAC](#-role-based-workspaces)

</div>

---

## 📌 Executive Overview

**JustTry FinTech CRM** is an end-to-end, multi-vertical financial operations and customer relationship management platform. Designed specifically for modern banking, retail lending institutions, wealth advisory firms, and insurance underwriters, it streamlines the customer journey from initial cold lead to final fund disbursal or policy issuance.

### Why JustTry?
Legacy CRMs and previous prototypes frequently break down due to expired API credentials, external database latency, or missing cloud service tokens. **JustTry eliminates all external dependencies:**
- **Zero API Keys Required:** Runs 100% out of the box with no external AI tokens or cloud credentials needed.
- **Zero Database Configuration:** Completely decoupled from external backends (Supabase/Firebase) via a high-performance, self-contained client-side **LocalStorage Engine**.
- **Instant Demo Ready:** Preloaded with clean, curated financial benchmark leads, appointments, and compliance tasks. Perfect for live pitch competitions, hackathon judging, and rapid evaluation.

---

## 🌟 Key Highlights & Features

### 1. 🧭 Interactive Onboarding Tour Guide
- Integrated **5-step guided walkthrough** modal accessible from the Landing Page hero, navigation bar, and Dashboard header.
- Guides new team members through the Tri-Vertical architecture, dynamic role-based workspaces, KYC compliance lifecycle, and operational task assistants.

### 2. 🎨 Premium Responsive Landing Page (`/`)
- Brand-tailored aesthetic with clean gradients, micro-metrics, and solution highlights.
- **1-Click Workspace Access:** Instant role selector cards allowing reviewers to jump straight into specialized personas:
  - 💼 **Sales & Advisory Workspace**
  - 🛡️ **Operations & KYC Queue**
  - 👑 **Executive Administration**

### 3. 💳 Tri-Vertical Financial Workflows
Different financial products demand different compliance lifecycles. JustTry supports dedicated pipelines with visual milestone trackers:
- **Loans Pipeline:** `New` ➔ `KYC Verification` ➔ `Documents Needed` ➔ `Eligibility Check` ➔ `Underwriting` ➔ `Approved` ➔ `Disbursed`
- **Investments & SIPs Pipeline:** `New` ➔ `Risk Profiling` ➔ `KYC Verification` ➔ `Portfolio Creation` ➔ `Activated`
- **Insurance Pipeline:** `New` ➔ `Medical Check` ➔ `Document Verification` ➔ `Underwriting` ➔ `Policy Issued`

### 4. 🛡️ Real-Time KYC Verification & Document Vault
- Integrated document upload dialog supporting Aadhaar, PAN, Bank Statements, ITR Tax filings, and Property Deeds.
- Dedicated **Verification Operations Dashboard** (`/dashboard/verification`) with one-click **Approve** or **Reject** actions, reviewer audit logging, and direct links to lead files.

### 5. 📋 Smart Operational Checklist & AI Task Assistant
- Context-aware task generation based on pipeline stage transitions and lead verticals.
- Dynamic task completion, priority badges (`High`, `Medium`, `Low`), due dates, and direct lead linkage.

### 6. 📅 Client Follow-ups & Communication Calendar
- Scheduled call reminders, in-person meetings, and document submission alerts.
- Multi-state filtering: **Upcoming**, **Pending**, and **Completed** with quick action status updates.

### 7. 📊 Executive Performance Analytics
- Conversion rate funnels, stage distribution charts, and product portfolio breakdown using **Recharts**.
- Team leaderboard tracking deal volume, active cases, and conversion efficiency.

### 8. 🔄 One-Click Demo Reset & LocalStorage Engine
- Full offline persistence across browser sessions, tabs, and reloads.
- Built-in **"Restore Clean Demo Dataset"** feature in Dashboard and Settings to instantly reset data to the curated benchmark state.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────┐
                    │      JustTry FinTech Web Platform      │
                    │   (Next.js 15 App Router + React 19)   │
                    └───────────────────┬────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  Sales & Advisory   │      │   Operations & KYC  │      │    Executive Admin  │
│  - Lead Origination │      │  - Document Vault   │      │  - Analytics Funnel │
│  - Pipeline Tracker │      │  - Approval Audit   │      │  - Team Leaderboard │
│  - Follow-up Hub    │      │  - Risk Assessment  │      │  - User Management  │
└──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │     LocalStorage Persistence Engine    │
                    │   - Reactive Browser-Level Storage     │
                    │   - Zero External API/DB Dependencies  │
                    │   - Deterministic Benchmark Seed Data  │
                    └────────────────────────────────────────┘
```

---

## 👥 Role-Based Workspaces

Switch workspaces instantly at any time from the **Landing Page**, **Top Header Role Selector**, or **Settings Page**:

| Role Persona | Target User | Key Capabilities & Accessible Modules |
| :--- | :--- | :--- |
| **💼 Sales Representative** | Relationship Managers, Loan Officers, Investment Advisors | Create leads, track multi-vertical pipelines, schedule follow-ups, upload client KYC documents, update lead stages. |
| **🛡️ Verification Officer** | Compliance Auditors, Risk Underwriters, Back-Office Ops | Access central KYC queue, audit customer identity documents, approve/reject submissions with reviewer stamps, verify eligibility. |
| **👑 Executive Admin** | Branch Managers, Sales Directors, C-Suite | Comprehensive portfolio analytics, team conversion rates, quota leaderboards, workspace user governance, and dataset management. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Recommended: `v20.x` or `v22.x`)
- **Package Manager**: `npm` (comes with Node) or `yarn` / `pnpm`

### 1. Clone the Repository
```bash
git clone https://github.com/iamthanushgowdap/JustTry.git
cd JustTry
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
The application is pre-configured to launch on port **9001**:
```bash
npm run dev
```

Open your browser and visit:
```
http://localhost:9001
```

### 4. Build for Production
To verify production compile and optimize the bundle:
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
JustTry/
├── src/
│   ├── ai/
│   │   └── flows/
│   │       └── automated-task-creation.ts   # Rule-based contextual task generation logic
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── follow-ups/                  # Client appointment & reminder schedule
│   │   │   ├── leads/                       # Leads registry & multi-stage pipeline detail
│   │   │   │   └── [id]/                    # Deep-dive lead profile, stages & docs
│   │   │   ├── performance/                 # Funnels, team leaderboards & analytics
│   │   │   ├── settings/                    # Role switching & demo data reset
│   │   │   ├── tasks/                       # Operational compliance checklist
│   │   │   ├── users/                       # Team workspace access management
│   │   │   ├── verification/                # Central KYC review & document audit queue
│   │   │   ├── layout.tsx                   # Dashboard wrapper with sidebar & header
│   │   │   └── page.tsx                     # Main executive & operational dashboard
│   │   ├── not-found.tsx                    # Custom branded 404 error page
│   │   ├── layout.tsx                       # Root layout & theme provider
│   │   └── page.tsx                         # High-converting landing page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── app-sidebar.tsx              # Adaptive navigation sidebar with role gating
│   │   │   ├── document-upload-dialog.tsx   # KYC document uploader with category tagging
│   │   │   ├── header.tsx                   # Top navigation with role badge & quick switcher
│   │   │   ├── lead-form.tsx                # Lead creation modal with Zod validation
│   │   │   ├── recent-leads.tsx             # Active pipeline preview card
│   │   │   └── stats-cards.tsx              # Dynamic financial metric cards
│   │   ├── interactive-tutorial.tsx         # 5-step guided onboarding walkthrough
│   │   └── ui/                              # Radix UI + Tailwind component library
│   ├── hooks/                               # Custom React hooks (theme, toast, mobile)
│   └── lib/
│       ├── actions.ts                       # Server actions & client-safe mutations
│       ├── data.ts                          # Seed dataset & LocalStorage state engine
│       ├── definitions.ts                   # TypeScript schemas, pipeline states & types
│       └── utils.ts                         # Tailwind CSS styling utilities (cn)
├── public/                                  # Static icons and assets
├── package.json                             # Dependencies, scripts, and engine config
├── tailwind.config.ts                       # Custom styling system and color tokens
├── tsconfig.json                            # TypeScript configuration
└── README.md                                # Platform documentation
```

---

## 🧰 Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React Server Components & Client Hydration)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, zero `any` leaks)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom FinTech color variables
- **Component Primitives:** [Radix UI](https://www.radix-ui.com/)
- **Iconography:** [Lucide React](https://lucide.dev/)
- **Charts & Data Viz:** [Recharts](https://recharts.org/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Storage Strategy:** Client-Side Deterministic LocalStorage Engine with SSR-safe hydration

---

## 📱 Viewport & Cross-Platform Support

JustTry is thoroughly tested and optimized for:
- 📱 **Mobile Screens (360px – 640px):** Responsive collapsible slide-out drawer, touch-friendly touch targets, horizontal scrolling tables.
- 💻 **Laptops & Tablets (768px – 1024px):** Adaptive 2-column dashboard grids, fluid dialog modals.
- 🖥️ **High-DPI & Ultrawide Displays (1280px – 4K):** Optimized layout containers, high-contrast badges, dark/light theme support.

---

## 💡 Quick Presentation Guide (For Demos & Hackathons)

1. **Start at the Landing Page (`/`):**
   - Click **"Launch Interactive Tour"** to showcase the 5-step guided feature overview.
   - Click one of the 3 role cards (e.g. **Sales Representative**) to instantly enter the workspace.
2. **Explore Pipeline Management (`/dashboard/leads`):**
   - Click on any benchmark lead (e.g. *Rajesh Sharma - Home Loan* or *Ananya Roy - Mutual Fund SIP*).
   - Advance the stage stepper (e.g. from `KYC Verification` to `Documents Needed`).
3. **Upload & Verify KYC Documents:**
   - On the lead page, click **Upload Document** and attach a file.
   - Switch role to **Verification Officer** from the top header.
   - Go to **Verification Queue** (`/dashboard/verification`) and click **Approve Document**. Observe the real-time audit status stamp.
4. **View Team Analytics (`/dashboard/performance`):**
   - Switch role to **Admin** to inspect the revenue conversion funnels and rep leaderboard.
5. **Reset Anytime:**
   - Click **Settings** ➔ **Restore Clean Demo Dataset** to return to the initial benchmark state instantly.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Open-source and free for commercial and educational use.

<div align="center">

Made with passion for modern FinTech engineering.  
**Repository:** [https://github.com/iamthanushgowdap/JustTry](https://github.com/iamthanushgowdap/JustTry)

</div>
