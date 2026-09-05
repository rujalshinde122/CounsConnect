# CounsConnect — Web Frontend

The counselor and practice management web portal for CounsConnect. Built with modern full-stack web standards, high-performance server-side rendering, and direct integration with self-hosted Supabase on Azure.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | `16.3.3` | Server Components, file-based routing, server actions |
| **UI Library** | [React](https://react.dev/) | `19.2.8` | Component rendering & hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.x` | Strict end-to-end type safety |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.x` | Modern CSS-first styling via `@tailwindcss/postcss` |
| **UI Primitives** | [shadcn/ui](https://ui.shadcn.com/) / Base UI | `^4.19.0` | Accessible, customizable component primitives |
| **Database & Auth** | [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) | `@supabase/ssr ^0.12.5` | Cookie-based SSR authentication & PostgreSQL client |
| **Icons** | [Lucide React](https://lucide.dev/) | `^1.34.0` | Clean, accessible vector icons |

---

## 📁 Directory Structure & Routing

```text
web-frontend/
├── app/
│   ├── (auth)/                     # Unauthenticated auth routes (grouped)
│   │   ├── login/page.tsx          # Counselor login
│   │   ├── register/page.tsx       # Practice registration
│   │   ├── forgot-password/page.tsx# Password reset request
│   │   └── layout.tsx              # Split-screen branded authentication layout
│   ├── auth/callback/route.ts      # OAuth / email link exchange handler
│   ├── dashboard/                  # Authenticated practice portal
│   │   ├── appointments/page.tsx   # Session scheduling & calendar management
│   │   ├── clients/
│   │   │   ├── page.tsx            # Client directory & filters
│   │   │   ├── new/page.tsx        # Client onboarding / intake form
│   │   │   └── [id]/page.tsx       # Client profile, clinical notes & history
│   │   ├── tasks/page.tsx          # Practice action items & follow-ups
│   │   ├── settings/page.tsx       # Profile, security & notification settings
│   │   ├── layout.tsx              # Persistent sidebar + header layout
│   │   └── page.tsx                # Main counselor analytics & daily schedule
│   ├── globals.css                 # Design system tokens & Tailwind v4 config
│   ├── layout.tsx                  # Root HTML shell & typography provider
│   └── page.tsx                    # Landing page / root redirect to dashboard
│
├── components/
│   ├── dashboard/                  # Domain-specific dashboard widgets
│   │   ├── TodaySchedule.tsx       # Day-at-a-glance appointments card
│   │   ├── RecentClientsCard.tsx   # Recent client activity list
│   │   ├── PendingTasksCard.tsx    # Urgent tasks with check-off action
│   │   ├── PracticeStats.tsx       # Practice metrics (active clients, sessions, hours)
│   │   └── SessionInfoCard.tsx     # Next upcoming session spotlight
│   ├── ui/                         # Atomic design components (shadcn/ui)
│   │   ├── button.tsx, card.tsx, input.tsx, select.tsx, badge.tsx, avatar.tsx, ...
│   ├── DashboardNavbar.tsx         # Top navigation with profile & quick search
│   └── Sidebar.tsx                 # Navigation sidebar with active route states
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client for Client Components ("use client")
│   │   └── server.ts               # Async cookie-aware client for Server Components
│   ├── types.ts                    # Shared domain interfaces (Client, Appointment, Note, etc.)
│   └── utils.ts                    # Utility functions (cn helper for tailwind-merge)
│
├── .env.example                    # Environment variable template
├── next.config.ts                  # Next.js 16 configuration
├── package.json                    # Project dependencies & scripts
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v20+ recommended (v18.18+ minimum)
- **npm**: v9+ (or `pnpm` / `yarn`)
- Access to the CounsConnect Supabase endpoint

### 2. Installation & Environment Setup

```bash
# 1. Navigate to the web frontend directory
cd web-frontend

# 2. Copy the environment variables template
cp .env.example .env.local

# 3. Install project dependencies
npm install

# 4. Start the local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Configure your `.env.local` file with the connection keys for the self-hosted Supabase instance:

```env
# =============================================================
# CounsConnect Web Frontend — Environment Configuration
# =============================================================
NEXT_PUBLIC_SUPABASE_URL=http://<AZURE_VM_IP_OR_DOMAIN>:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Note**: Both variables require the `NEXT_PUBLIC_` prefix to be accessible in client-side Supabase operations. Never commit `.env.local` to version control.

---

## 🏛️ Core Architecture & Conventions

### 1. Supabase Client Usage Pattern (SSR-Safe)

To maintain cookie session synchronization between server rendering and browser interactions, follow the strict client isolation pattern:

#### For Client Components (`"use client"`):
Use `createClient` from `@/lib/supabase/client` for event handlers, forms, and browser-side listeners:
```typescript
"use client"
import { createClient } from "@/lib/supabase/client"

export function ClientComponent() {
  const supabase = createClient()
  // Run queries or mutations in response to user interaction
}
```

#### For Server Components, Route Handlers & Server Actions:
Use async `createClient` from `@/lib/supabase/server` to read session cookies securely:
```typescript
import { createClient } from "@/lib/supabase/server"

export default async function ServerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Fetch data directly on the server without client roundtrips
}
```

### 2. Component Boundaries (Server vs. Client)
- **Default to Server Components**: Fetch data on the server in `page.tsx` whenever possible for fast initial load and zero client bundle overhead.
- **Isolate Client Components**: Keep `"use client"` pushed down to interactive leaf components (forms, dialogs, dropdowns, tab switchers).
- **Pass Data via Props**: Server pages pass typed records down to interactive client cards and tables.

### 3. Type Safety
All domain models (Clients, Appointments, Tasks, Notes, Counselors) must be typed using definitions in `@/lib/types.ts`. Avoid `any` types.

### 4. Design System & Styling
- **Tokens**: Theme tokens are declared in `app/globals.css` using CSS custom properties (`--primary`, `--background`, `--card`, `--border`, `--radius`).
- **Brand Palette**:
  - Primary Brand: **Organic Sage Teal** (`#588B8B` / `var(--primary)`)
  - Background Canvas: **Warm Alabaster Cream** (`#F6F5EE` / `var(--background)`)
  - Surfaces: **Elevated Pure White** (`#FFFFFF` / `var(--card)`)
  - Typography: **Deep Organic Charcoal** (`#2D3A3A` / `var(--foreground)`)
- **Class Merging**: Always use the `cn(...)` utility from `@/lib/utils` when applying conditional Tailwind classes.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches Next.js dev server with Turbopack / fast refresh on [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Builds optimized production bundle with type checking and page static/dynamic analysis |
| `npm run start` | Runs the production build locally |
| `npm run lint` | Runs ESLint 9 checks across all TypeScript and JSX files |
