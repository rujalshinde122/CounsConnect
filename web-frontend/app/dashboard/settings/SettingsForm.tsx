'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Globe } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface SettingsFormProps {
  userId: string
  initialName: string
  initialPhone: string
  initialPlaceOfStay: string
  email: string
  role: string
}

export default function SettingsForm({
  userId, initialName, initialPhone, initialPlaceOfStay, email, role,
}: SettingsFormProps) {
  const router = useRouter()
  const { t, locale, setLocale, languages } = useLanguage()

  // Profile section
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [placeOfStay, setPlaceOfStay] = useState(initialPlaceOfStay)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password section
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const inputCls = 'w-full px-3 py-2 border border-[#E2E0D6] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#588B8B] bg-white text-[#2D3A3A] disabled:opacity-60'

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        phone: phone.trim() || null,
        place_of_stay: placeOfStay.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    setProfileSaving(false)
    if (error) {
      setProfileError(error.message)
    } else {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
      router.refresh()
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordSaving(true)
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordError('Current password is incorrect')
      setPasswordSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setPasswordSaving(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile info Card */}
      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-[#2D3A3A] text-sm">{t('dashboard.settings.profileSection')}</h3>
          <p className="text-xs text-[#5A6B6B] mt-0.5">{t('dashboard.settings.profileSubtitle')}</p>
        </div>

        {profileError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-lg text-xs font-medium">
            {profileError}
          </div>
        )}

        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Full name</label>
            <input
              type="text"
              className={inputCls}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Email address</label>
            <input
              type="email"
              className={`${inputCls} bg-[#F6F5EE]/60 text-[#889898] cursor-not-allowed`}
              value={email}
              disabled
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Phone number</label>
              <input
                type="tel"
                className={inputCls}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">City / Place of stay</label>
              <input
                type="text"
                className={inputCls}
                value={placeOfStay}
                onChange={e => setPlaceOfStay(e.target.value)}
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="bg-[#588B8B] hover:bg-[#3D6363] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {profileSaving ? t('common.loading') : t('common.save')}
            </button>
            {profileSaved && (
              <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {t('dashboard.settings.profileSaved')}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password section */}
      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-[#2D3A3A] text-sm">Security & Password</h3>

        {passwordError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-lg text-xs font-medium">
            {passwordError}
          </div>
        )}

        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Current password</label>
            <input
              type="password"
              className={inputCls}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">New password</label>
              <input
                type="password"
                className={inputCls}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Confirm new password</label>
              <input
                type="password"
                className={inputCls}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-[#2D3A3A] hover:bg-[#1A2525] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {passwordSaving ? t('common.loading') : 'Update Password'}
            </button>
            {passwordSaved && (
              <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {t('dashboard.settings.passwordSaved')}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Language & Locale Section */}
      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#588B8B]" />
            <h2 className="text-sm font-bold text-[#2D3A3A]">{t('dashboard.settings.languageSection')}</h2>
          </div>
          <p className="text-xs text-[#5A6B6B] mt-0.5">
            {t('dashboard.settings.languageSubtitle')}
          </p>
        </div>

        <p className="text-xs text-[#889898]">
          {t('dashboard.settings.languageHelp')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {languages.map((lang) => {
            const isSelected = lang.code === locale
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#588B8B] bg-[#588B8B]/5 shadow-xs ring-1 ring-[#588B8B]'
                    : 'border-[#E2E0D6] bg-white hover:bg-[#F6F5EE]/50 hover:border-[#588B8B]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base font-bold text-[#2D3A3A]">{lang.native}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#588B8B] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-[#5A6B6B]">{lang.label}</span>
                  <p className="text-[10px] text-[#889898] mt-0.5">
                    {lang.code === 'en' ? 'Default international' : lang.code === 'hi' ? 'मानक देवनागरी लिपि' : 'स्थानिक मराठी देवनागरी'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
