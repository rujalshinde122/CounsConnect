import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Disable static caching so every ping generates real database activity
export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Execute a lightweight query to touch PostgREST and Postgres
    // This resets Supabase's 7-day inactivity timer
    const { error, status } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    const latencyMs = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          supabase: 'unreachable',
          message: error.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase project is active and healthy',
      timestamp: new Date().toISOString(),
      latencyMs,
      supabase: {
        connected: true,
        httpStatus: status,
      },
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
