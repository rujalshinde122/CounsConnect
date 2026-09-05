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
         │   Next.js 16 App   │               │   Expo SDK 52 /     │
         │  Router + Tailwind │               │   React Native 0.76 │
         │ (Counselor Portal) │               │   (Client Mobile)   │
         └────────────────────┘               └─────────────────────┘
```

- **Web Frontend (`web-frontend/`)**: Modern Next.js 16 App Router portal (React 19 + Tailwind CSS v4) for counselors with appointment scheduling, client case notes, intake workflows, and practice analytics.
- **Mobile Frontend (`app-frontend/`)**: Universal Expo SDK 52 & React Native 0.76 application designed for client engagement, session tracking, and mood journaling.
- **Backend Infrastructure**: Self-hosted Supabase on Microsoft Azure Virtual Machines running PostgreSQL, GoTrue Auth, Realtime, and Row Level Security (RLS).

---

## 🛠️ Technology Stack Summary

| Workspace | Technology | Version | Key Libraries |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | [Next.js](https://nextjs.org/) | `16.3.3` | React `19.2.8`, Tailwind CSS `^4.x`, `@supabase/ssr` `^0.12.5`, Lucide React `^1.34.0` |
| **Mobile Frontend** | [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/) | `SDK 52` (`0.76.9`) | Expo Router `4.0.22`, React `18.3.1`, `@supabase/supabase-js` `^2.112.4`, `expo-secure-store` |
| **Backend** | [Supabase](https://supabase.com/) | Self-Hosted | PostgreSQL 15, GoTrue Auth, PostgREST, Realtime Engine |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.x` | End-to-end type safety across both client apps |

---

## 📁 Repository Structure

```text
CounsConnect/
├── web-frontend/             # Next.js 16 Web Application (Counselor Portal)
│   ├── app/                  # App Router routes (auth, dashboard, clients, tasks)
│   ├── components/           # UI primitives (shadcn/ui) & dashboard widgets
│   ├── lib/                  # Supabase clients (client & server) and shared types
│   ├── README.md             # In-depth web portal architecture & guidelines
│   └── .env.example          # Environment variables template
│
├── app-frontend/             # React Native / Expo Mobile App (Client App)
│   ├── app/                  # Expo file-based routing
│   ├── components/           # Mobile UI components
│   ├── constants/            # Colors and themes
│   ├── lib/                  # Supabase client with SecureStore keychain adapter
│   ├── README.md             # Mobile setup & architecture guidelines
│   └── .env.example          # Mobile environment variables template
│
├── .gitignore                # Unified root gitignore for monorepo
└── README.md                 # Project documentation (this file)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ recommended (v18.18+ minimum)
- **npm**: v9+ (or `pnpm` / `yarn`)
- Access to the CounsConnect Supabase instance (or self-hosted local instance)

---

### 2. Web Frontend Setup (`web-frontend/`)

```bash
# Navigate to web-frontend
cd web-frontend

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and Anon Key

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the web portal. For complete component conventions and Supabase SSR guidelines, see [`web-frontend/README.md`](./web-frontend/README.md).

---

### 3. Mobile Frontend Setup (`app-frontend/`)

```bash
# Navigate to app-frontend
cd app-frontend

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase URL and Anon Key

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

For platform-specific simulators and hardware keychain details, see [`app-frontend/README.md`](./app-frontend/README.md).

---

## 🔒 Security & Best Practices

- **Never commit `.env` files**: All environment files containing secrets (`.env`, `.env.local`, `*.env`) are strictly ignored by `.gitignore`. Use `.env.example` templates for configuration.
- **Row Level Security (RLS)**: PostgreSQL tables in Supabase enforce strict RLS policies to isolate client health records.
