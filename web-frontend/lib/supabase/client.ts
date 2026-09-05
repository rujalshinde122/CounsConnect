import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client
// Used in: Client Components, event handlers, real-time subscriptions
// Points to Azure self-hosted Supabase — change env vars to migrate to cloud

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
