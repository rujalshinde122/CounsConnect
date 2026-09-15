'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowUpRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F6F5EE]">
      {/* Left — Branding Panel (Larana Sage Minimal Aesthetic) */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#3D6363] via-[#2D4E4E] to-[#263F3F] p-12 lg:p-16 text-white relative overflow-hidden">
        {/* Subtle Decorative Geometric Accents from Larana Template */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-12 text-white/20 text-7xl font-mono select-none">
          ✳
        </div>

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white text-[#263F3F] rounded-2xl flex items-center justify-center font-extrabold text-base shadow-sm">
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">CounsConnect</span>
              <span className="text-[#A3E635] text-xs">✳</span>
            </div>
            <p className="text-[11px] text-[#DDEAE7] font-medium tracking-wide">Clinical Practice & Therapy</p>
          </div>
        </div>

        {/* Center Quote & Highlights */}
        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full text-xs text-[#D9F99D]">
            <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Modern Clinical Workspace</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Care for people, seamlessly managed in one place.
          </h2>

          <p className="text-sm text-[#DDEAE7] leading-relaxed">
            A minimal, distraction-free clinical platform built for therapists, psychologists, and counselors.
          </p>

          <div className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#588B8B] border border-white/20 flex items-center justify-center text-sm font-bold text-white shadow-xs">
              CC
            </div>
            <div>
              <p className="text-xs font-bold text-white">St. Mary&apos;s Clinical Network</p>
              <p className="text-[11px] text-[#DDEAE7]">HIPAA & Data Privacy Compliant</p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between text-xs text-[#DDEAE7]/80 relative z-10 pt-8 border-t border-white/10">
          <span>© 2026 CounsConnect System</span>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-lg border border-white/30 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Container */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E0D6] shadow-xs space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#588B8B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#588B8B]">Sign In</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2D3A3A]">Welcome back</h1>
            <p className="text-xs text-[#5A6B6B]">Enter your clinical account credentials to continue</p>
          </div>

          {error && (
            <div className="text-xs text-[#991B1B] bg-[#FEE2E2] border border-[#EF4444]/30 px-4 py-3 rounded-2xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="counselor@stmarys.org"
                className="rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/60 focus:bg-white text-xs sm:text-sm px-4 py-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/60 focus:bg-white text-xs sm:text-sm px-4 py-2.5"
              />
            </div>

            <Button
              type="submit"
              id="login-btn"
              className="w-full bg-[#588B8B] hover:bg-[#3D6363] text-white font-bold text-xs py-2.5 rounded-full shadow-xs transition-colors mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Workspace'}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#5A6B6B]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#588B8B] font-bold hover:underline underline-offset-4">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
