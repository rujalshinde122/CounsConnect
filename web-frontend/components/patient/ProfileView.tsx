'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  GraduationCap,
  Briefcase,
  TrendingUp,
  BrainCircuit,
  Save,
  CheckCircle2,
  Edit3,
  X,
  ShieldCheck,
} from 'lucide-react'
import type { Client, Profile } from '@/lib/types'

interface ProfileViewProps {
  client: Client
  counselor: Profile
}

export default function ProfileView({ client, counselor }: ProfileViewProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: client.name,
    age: client.age.toString(),
    gender: client.gender,
    education: client.education || '',
    maritalStatus: client.marital_status || '',
    profession: client.profession || '',
    wantsGrowth: client.wants_growth,
    swotStrengths: client.swot_strengths || '',
    swotWeaknesses: client.swot_weaknesses || '',
    swotOpportunities: client.swot_opportunities || '',
    swotThreats: client.swot_threats || '',
  })

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSavedSuccess(false)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          name: form.name.trim(),
          age: parseInt(form.age, 10),
          gender: form.gender,
          education: form.education || null,
          marital_status: form.maritalStatus || null,
          profession: form.profession || null,
          wants_growth: form.wantsGrowth,
          swot_strengths: form.swotStrengths || null,
          swot_weaknesses: form.swotWeaknesses || null,
          swot_opportunities: form.swotOpportunities || null,
          swot_threats: form.swotThreats || null,
        })
        .eq('id', client.id)

      if (updateError) throw new Error(updateError.message)

      setSavedSuccess(true)
      setEditing(false)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save changes'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const swotCategories = [
    { key: 'swotStrengths', label: 'Strengths', value: form.swotStrengths, bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-950', badge: 'bg-emerald-100 text-emerald-800' },
    { key: 'swotWeaknesses', label: 'Weaknesses', value: form.swotWeaknesses, bg: 'bg-rose-50/70 border-rose-200 text-rose-950', badge: 'bg-rose-100 text-rose-800' },
    { key: 'swotOpportunities', label: 'Opportunities', value: form.swotOpportunities, bg: 'bg-blue-50/70 border-blue-200 text-blue-950', badge: 'bg-blue-100 text-blue-800' },
    { key: 'swotThreats', label: 'Threats', value: form.swotThreats, bg: 'bg-amber-50/70 border-amber-200 text-amber-950', badge: 'bg-amber-100 text-amber-800' },
  ]

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E0D6]">
        <div>
          <h1 className="text-xl font-bold text-[#2D3A3A] tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-[#588B8B]" /> Personal & Clinical Profile
          </h1>
          <p className="text-xs text-[#5A6B6B] mt-0.5">
            Data and self-reflections recorded during your intake onboarding
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
            </span>
          )}

          {!editing ? (
            <Button
              type="button"
              onClick={() => setEditing(true)}
              variant="outline"
              className="rounded-full text-xs font-semibold px-4 py-2 border-[#E2E0D6] text-[#2D3A3A] hover:bg-white flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#588B8B]" />
              Edit Profile
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setEditing(false)}
              variant="outline"
              className="rounded-full text-xs font-semibold px-4 py-2 border-[#E2E0D6] text-[#5A6B6B]"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Main View / Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Personal Demographics */}
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E0D6] pb-3">
            <h2 className="text-sm font-bold text-[#2D3A3A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#588B8B]" /> Personal Information
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Client
            </span>
          </div>

          {!editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5">
                  <span className="text-[#5A6B6B] text-[11px] block">Full Name</span>
                  <span className="font-bold text-[#2D3A3A] text-sm">{client.name}</span>
                </div>
                <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5">
                  <span className="text-[#5A6B6B] text-[11px] block">Age</span>
                  <span className="font-bold text-[#2D3A3A] text-sm">{client.age} yrs</span>
                </div>
                <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5">
                  <span className="text-[#5A6B6B] text-[11px] block">Gender</span>
                  <span className="font-bold text-[#2D3A3A] text-sm">{client.gender}</span>
                </div>
                <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5">
                  <span className="text-[#5A6B6B] text-[11px] block">Marital Status</span>
                  <span className="font-bold text-[#2D3A3A] text-sm">
                    {client.marital_status === 'Unmarried' ? 'Single / Unmarried' : (client.marital_status || 'Not specified')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5 flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#588B8B]" />
                  <div>
                    <span className="text-[#5A6B6B] text-[11px] block">Education Level</span>
                    <span className="font-bold text-[#2D3A3A] text-xs">
                      {client.education || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5 flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-[#588B8B]" />
                  <div>
                    <span className="text-[#5A6B6B] text-[11px] block">Profession</span>
                    <span className="font-bold text-[#2D3A3A] text-xs">
                      {client.profession || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {client.wants_growth && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFCCB] border border-[#84CC16]/40 text-xs font-semibold text-[#4D7C0F]">
                  <TrendingUp className="w-4 h-4" />
                  Enrolled in Personality Development & Growth Track
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    className="rounded-xl border-[#E2E0D6] text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Age</Label>
                  <Input
                    type="number"
                    value={form.age}
                    onChange={e => update('age', e.target.value)}
                    className="rounded-xl border-[#E2E0D6] text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Gender</Label>
                  <select
                    value={form.gender}
                    onChange={e => update('gender', e.target.value)}
                    className="w-full border border-[#E2E0D6] rounded-xl px-3.5 py-2 text-xs bg-white text-[#2D3A3A]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Marital Status</Label>
                  <select
                    value={form.maritalStatus}
                    onChange={e => update('maritalStatus', e.target.value)}
                    className="w-full border border-[#E2E0D6] rounded-xl px-3.5 py-2 text-xs bg-white text-[#2D3A3A]"
                  >
                    <option value="">Select Status</option>
                    <option value="Unmarried">Single / Unmarried</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Education</Label>
                  <Input
                    value={form.education}
                    onChange={e => update('education', e.target.value)}
                    placeholder="Education level"
                    className="rounded-xl border-[#E2E0D6] text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Profession</Label>
                  <Input
                    value={form.profession}
                    onChange={e => update('profession', e.target.value)}
                    placeholder="Profession"
                    className="rounded-xl border-[#E2E0D6] text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.wantsGrowth}
                    onChange={e => update('wantsGrowth', e.target.checked)}
                    className="w-4 h-4 accent-[#588B8B] rounded"
                  />
                  <span className="text-xs font-medium text-[#2D3A3A]">
                    Interested in Personality Development & Growth Track
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Issues & Focus Areas */}
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs p-6 space-y-4">
          <div className="border-b border-[#E2E0D6] pb-3">
            <h2 className="text-sm font-bold text-[#2D3A3A]">Primary Issues & Focus Concerns</h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              Therapeutic issues identified for counseling
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {client.issues && client.issues.length > 0 ? (
              client.issues.map((issue) => (
                <span
                  key={issue}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#EDF4F2] text-[#263F3F] border border-[#588B8B]/40"
                >
                  {issue}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#5A6B6B] italic">No specific issues noted.</span>
            )}
          </div>
        </div>

        {/* Card 3: SWOT Self-Assessment */}
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs p-6 space-y-4">
          <div className="border-b border-[#E2E0D6] pb-3">
            <h2 className="text-sm font-bold text-[#2D3A3A] flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#588B8B]" /> SWOT Self-Assessment
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              Personal reflections on strengths, weaknesses, opportunities, and threats
            </p>
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {swotCategories.map(({ key, label, value, bg, badge }) => (
                <div key={key} className={`rounded-xl border p-4 space-y-1.5 ${bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                      SWOT
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {value || <span className="opacity-60 italic">Not specified</span>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'swotStrengths', label: 'Strengths', placeholder: "Your strengths..." },
                { key: 'swotWeaknesses', label: 'Weaknesses', placeholder: "Your weaknesses..." },
                { key: 'swotOpportunities', label: 'Opportunities', placeholder: "Your opportunities..." },
                { key: 'swotThreats', label: 'Threats', placeholder: "Your threats..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">{label}</Label>
                  <Textarea
                    rows={3}
                    value={form[key as keyof typeof form] as string}
                    onChange={e => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="resize-none text-xs rounded-xl border-[#E2E0D6] text-[#2D3A3A] p-3 focus:border-[#588B8B]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save button when in edit mode */}
        {editing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
              className="rounded-full text-xs font-semibold px-5 py-2 border-[#E2E0D6] text-[#5A6B6B]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-6 py-2 shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        )}

      </form>

    </div>
  )
}
