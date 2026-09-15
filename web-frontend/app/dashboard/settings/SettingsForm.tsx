'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

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
        <h3 className="font-bold text-[#2D3A3A] text-sm">Personal Information</h3>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Email address</label>
              <input
                type="email"
                className={`${inputCls} bg-[#F6F5EE]/60 text-[#889898] cursor-not-allowed`}
                value={email}
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A6B6B] mb-1">Account role</label>
              <input
                type="text"
                className={`${inputCls} bg-[#F6F5EE]/60 text-[#889898] cursor-not-allowed capitalize`}
                value={role}
                disabled
              />
            </div>
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
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
            {profileSaved && (
              <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
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
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
            {passwordSaved && (
              <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Password updated!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
