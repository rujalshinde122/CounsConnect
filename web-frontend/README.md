# CounsConnect — Web Frontend

A Next.js 15 counseling platform for CounsConnect, powered by Supabase (self-hosted on Azure → Supabase Cloud).

## Stack

- **Framework**: Next.js 15 (App Router)
- **Database / Auth / Realtime**: Supabase (`@supabase/ssr`)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (frontend) + Azure VM (Supabase backend)

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL + anon key
2. `npm install`
3. `npm run dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-azure-domain.com   # Azure self-hosted
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

When migrating to Supabase Cloud, just change these two values — zero code changes.
