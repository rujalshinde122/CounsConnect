'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const role = 'counselor'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role } },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#F6F5EE]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E2E0D6] shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ECFCCB] border border-[#84CC16]/30 flex items-center justify-center mx-auto text-[#4D7C0F]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#2D3A3A]">Check your email</h2>
          <p className="text-xs text-[#5A6B6B] leading-relaxed">
            We sent an activation link to <strong className="text-[#2D3A3A]">{email}</strong>. Click the link to complete your counselor registration.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F6F5EE]">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#3D6363] via-[#2D4E4E] to-[#263F3F] p-12 lg:p-16 text-white relative overflow-hidden">
        <div className="absolute bottom-12 right-12 text-white/20 text-7xl font-mono select-none">
          ✳
        </div>
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

        <div className="space-y-4 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full text-xs text-[#D9F99D]">
            <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Join the Network</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Start your counseling practice workspace.
          </h2>
          <p className="text-sm text-[#DDEAE7] leading-relaxed">
            Manage patient intakes, automated task reminders, clinical notes, and session schedules with ease.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-[#DDEAE7]/80 relative z-10 pt-8 border-t border-white/10">
          <span>© 2026 CounsConnect System</span>
          <div className="w-6 h-6 rounded-lg border border-white/30 flex items-center justify-center">
            <ArrowUpRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E0D6] shadow-xs space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#588B8B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#588B8B]">Registration</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2D3A3A]">Create account</h1>
            <p className="text-xs text-[#5A6B6B]">Fill in your clinical credentials to get started</p>
          </div>

          {error && (
            <div className="text-xs text-[#991B1B] bg-[#FEE2E2] border border-[#EF4444]/30 px-4 py-3 rounded-2xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">Full name</Label>
              <Input id="name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Full Name" className="rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/60 focus:bg-white text-xs sm:text-sm px-4 py-2.5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">Email</Label>
              <Input id="reg-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="counselor@stmarys.org" className="rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/60 focus:bg-white text-xs sm:text-sm px-4 py-2.5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">Password</Label>
              <Input id="reg-password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/60 focus:bg-white text-xs sm:text-sm px-4 py-2.5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">Confirm password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className="rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/60 focus:bg-white text-xs sm:text-sm px-4 py-2.5" />
            </div>
            <Button id="register-btn" type="submit" className="w-full bg-[#588B8B] hover:bg-[#3D6363] text-white font-bold text-xs py-2.5 rounded-full shadow-xs transition-colors mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Counselor Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-[#5A6B6B]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#588B8B] font-bold hover:underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
