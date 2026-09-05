# CounsConnect

**Modern Mental Health Counseling & Practice Management Platform**

CounsConnect is a full-stack, multi-platform healthcare application connecting mental health professionals with clients through a modern Web Portal and Mobile Application, backed by a unified self-hosted Supabase backend on Microsoft Azure.

---

## 🏗️ Architecture Overview

```
                          ┌────────────────────────┐
                          │     Microsoft Azure    │
                          │   Self-Hosted Supabase │
                          │ (PostgreSQL, Auth, RLS)│
                          └───────────▲────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   │                                     │
         ┌─────────┴──────────┐               ┌──────────┴──────────┐
         │    web-frontend    │               │    app-frontend     │
         │   Next.js 14 App   │               │    Expo / React     │
         │  Router + Tailwind │               │   Native (Mobile)   │
         │ (Counselor Portal) │               │   (Client Mobile)   │
         └────────────────────┘               └─────────────────────┘
```

- **Web Frontend (`web-frontend/`)**: Modern Next.js 14 App Router portal for counselors with appointment scheduling, client case notes, intake workflows, and practice analytics.
- **Mobile Frontend (`app-frontend/`)**: React Native & Expo application designed for mobile client engagement and appointments.
- **Backend Infrastructure**: Self-hosted Supabase on Microsoft Azure Virtual Machines running PostgreSQL, GoTrue Auth, Realtime, and Row Level Security (RLS).

---

## 📁 Repository Structure

```text
CounsConnect/
├── web-frontend/             # Next.js 14 Web Application (Counselor Portal)
│   ├── app/                  # App Router pages (auth, dashboard, clients, etc.)
│   ├── components/           # UI components & design system building blocks
│   ├── lib/                  # Supabase client & utilities
│   └── .env.example          # Environment variables template
│
├── app-frontend/             # React Native / Expo Mobile App (Client App)
│   ├── app/                  # Expo file-based routing
│   ├── components/           # Mobile UI components
│   ├── constants/            # Colors and themes
│   └── .env.example          # Mobile environment variables template
│
├── .gitignore                # Unified root gitignore for monorepo
└── README.md                 # Project documentation (this file)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm** or **pnpm** / **yarn**
- Access to the CounsConnect Supabase instance (or self-hosted local instance)

---

### 2. Web Frontend Setup (`web-frontend/`)

```bash
# Navigate to web-frontend
cd web-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and Anon Key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the web portal.

---

### 3. Mobile Frontend Setup (`app-frontend/`)

```bash
# Navigate to app-frontend
cd app-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase URL and Anon Key

# Start the Expo development server
npx expo start
```

---

## 🔒 Security & Best Practices

- **Never commit `.env` files**: All environment files containing secrets are ignored by `.gitignore`. Use `.env.example` templates for configuration.
- **Row Level Security (RLS)**: PostgreSQL tables in Supabase enforce strict RLS policies to isolate client health records.
