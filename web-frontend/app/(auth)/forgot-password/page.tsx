'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5EE] p-6 relative">
      {/* Language Switcher Fixed at Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher variant="auth" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#588B8B] rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-xs">
              C
            </div>
            <div className="text-left">
              <span className="font-bold text-[#2D3A3A] text-lg block leading-tight">{t('common.appName')}</span>
              <span className="text-[11px] text-[#5A6B6B] leading-tight">{t('common.practiceWorkspace')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xs border border-[#E2E0D6] p-8 sm:p-10 space-y-6">
          {!sent ? (
            <>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-extrabold text-[#2D3A3A] tracking-tight">
                  {t('auth.forgotPassword.title')}
                </h1>
                <p className="text-xs text-[#5A6B6B]">
                  {t('auth.forgotPassword.subtitle')}
                </p>
              </div>

              {error && (
                <div className="bg-[#FEE2E2] border border-[#EF4444]/30 text-[#991B1B] px-4 py-3 rounded-2xl text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reset-email" className="block text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">
                    {t('auth.forgotPassword.emailLabel')}
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="counselor@practice.com"
                    className="w-full px-4 py-2.5 border border-[#E2E0D6] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#588B8B] bg-[#F6F5EE]/60 focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  id="send-reset-btn"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#588B8B] hover:bg-[#3D6363] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-full text-xs transition-colors shadow-xs"
                >
                  {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.submitButton')}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 bg-[#ECFCCB] border border-[#84CC16]/30 rounded-2xl flex items-center justify-center mx-auto text-[#4D7C0F]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#2D3A3A]">{t('auth.forgotPassword.successMessage')}</h2>
              <p className="text-xs text-[#5A6B6B]">
                {email}
              </p>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#588B8B] hover:text-[#3D6363] font-semibold hover:underline underline-offset-4"
            >
              <ArrowLeft className="w-3 h-3" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
