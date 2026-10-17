'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LogOut, Sparkles, CheckCircle2, Plus, X } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// Default test counselor for development & client testing
const DEFAULT_COUNSELOR_ID = '5bb94591-0d5f-4ada-8db0-1a46f13eabdd'

const ISSUE_OPTIONS = [
  'Exam fear', 'Future worries', 'Anxiety', 'Anger',
  'Depression', 'Loneliness', 'Relationship issues', 'Stress',
  'Grief', 'Self-esteem', 'Addiction', 'Trauma',
]

const STEPS = ['Personal Info', 'Issues & Concerns', 'SWOT Analysis']

export default function PatientOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    education: '',
    maritalStatus: '',
    profession: '',
    issues: [] as string[],
    wantsGrowth: false,
    swotStrengths: '',
    swotWeaknesses: '',
    swotOpportunities: '',
    swotThreats: '',
  })

  // Custom issue state
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customIssueInput, setCustomIssueInput] = useState('')

  useEffect(() => {
    async function checkAuthAndExisting() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check if intake is already completed
      const { data: client } = await supabase
        .from('clients')
        .select('id, name, age, gender, education, marital_status, profession, issues, wants_growth, swot_strengths, swot_weaknesses, swot_opportunities, swot_threats')
        .eq('user_id', user.id)
        .maybeSingle()

      if (client) {
        // Already completed intake! Redirect to patient home
        router.push('/patient')
        return
      }

      // Pre-fill name from profile / user metadata
      const profileName = user.user_metadata?.name || ''
      if (profileName) {
        setForm(prev => ({ ...prev, name: profileName }))
      }

      setLoadingInitial(false)
    }

    checkAuthAndExisting()
  }, [router])

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleIssue = (issue: string) => {
    update(
      'issues',
      form.issues.includes(issue)
        ? form.issues.filter(i => i !== issue)
        : [...form.issues, issue]
    )
  }

  const handleAddCustomIssue = () => {
    const trimmed = customIssueInput.trim()
    if (!trimmed) return
    if (!form.issues.includes(trimmed)) {
      setForm(prev => ({ ...prev, issues: [...prev.issues, trimmed] }))
    }
    setCustomIssueInput('')
    setShowCustomInput(false)
  }

  const handleRemoveCustomIssue = (issueToRemove: string) => {
    setForm(prev => ({
      ...prev,
      issues: prev.issues.filter(i => i !== issueToRemove),
    }))
  }

  const handleNextStep = () => {
    setError('')
    if (step === 0) {
      if (!form.name.trim()) {
        setError('Please enter your full name')
        return
      }
      if (!form.age || parseInt(form.age, 10) < 1 || parseInt(form.age, 10) > 120) {
        setError('Please enter a valid age')
        return
      }
      if (!form.gender) {
        setError('Please select your gender')
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setError('')
    setStep(prev => Math.max(0, prev - 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You are not authenticated. Please log in again.')
      setSubmitting(false)
      return
    }

    try {
      // 1. Check if client record already exists for this patient
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let clientRecordId = existingClient?.id

      if (existingClient) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            counselor_id: DEFAULT_COUNSELOR_ID,
            name: form.name.trim(),
            age: parseInt(form.age, 10),
            gender: form.gender,
            education: form.education || null,
            marital_status: form.maritalStatus || null,
            profession: form.profession || null,
            issues: form.issues,
            symptoms: [],
            wants_growth: form.wantsGrowth,
            swot_strengths: form.swotStrengths || null,
            swot_weaknesses: form.swotWeaknesses || null,
            swot_opportunities: form.swotOpportunities || null,
            swot_threats: form.swotThreats || null,
            status: 'Active',
          })
          .eq('id', existingClient.id)

        if (updateError) throw new Error(updateError.message)
      } else {
        const { data: insertedClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            counselor_id: DEFAULT_COUNSELOR_ID,
            name: form.name.trim(),
            age: parseInt(form.age, 10),
            gender: form.gender,
            education: form.education || null,
            marital_status: form.maritalStatus || null,
            profession: form.profession || null,
            issues: form.issues,
            symptoms: [],
            wants_growth: form.wantsGrowth,
            swot_strengths: form.swotStrengths || null,
            swot_weaknesses: form.swotWeaknesses || null,
            swot_opportunities: form.swotOpportunities || null,
            swot_threats: form.swotThreats || null,
            notes: '',
            status: 'Active',
          })
          .select('id')
          .single()

        if (insertError) throw new Error(insertError.message)
        clientRecordId = insertedClient?.id
      }

      // 2. Update or insert into public.patient_profiles
      const { data: existingPatientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingPatientProfile) {
        await supabase
          .from('patient_profiles')
          .update({
            assigned_counselor_id: DEFAULT_COUNSELOR_ID,
            client_id: clientRecordId,
            is_intake_completed: true,
          })
          .eq('id', existingPatientProfile.id)
      } else {
        await supabase
          .from('patient_profiles')
          .insert({
            user_id: user.id,
            assigned_counselor_id: DEFAULT_COUNSELOR_ID,
            client_id: clientRecordId,
            is_intake_completed: true,
          })
      }

      // 3. Update profiles table display name
      await supabase
        .from('profiles')
        .update({ name: form.name.trim() })
        .eq('id', user.id)

      // 4. Redirect to client homepage
      router.push('/patient')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      setError(message)
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F5EE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#588B8B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#5A6B6B]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Filter custom issues that are not part of default options
  const customIssues = form.issues.filter(i => !ISSUE_OPTIONS.includes(i))

  return (
    <div className="min-h-screen bg-[#F6F5EE] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Navbar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#588B8B] to-[#3D6363] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
            C
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#2D3A3A] block leading-tight">
              CounsConnect
            </span>
            <p className="text-[11px] text-[#5A6B6B] font-medium">Patient Intake & Profile</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="auth" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#5A6B6B] hover:text-[#991B1B] hover:bg-rose-50 border border-[#E2E0D6] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Form Card */}
      <main className="max-w-2xl w-full mx-auto my-auto space-y-4">
        
        {/* Helper Banner */}
        <div className="bg-[#EDF4F2] border border-[#588B8B]/30 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#588B8B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#263F3F] leading-relaxed">
            <strong className="font-bold">Welcome to CounsConnect!</strong> Please complete your profile and initial clinical intake below before entering your portal. Your responses are directly shared with your dedicated counselor to tailor your sessions.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden">
          
          {/* Card Header & Steps Indicator */}
          <div className="px-6 py-5 border-b border-[#E2E0D6] bg-[#F6F5EE]/40">
            <h2 className="text-sm font-bold text-[#2D3A3A]">Client Intake Form</h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>

            <div className="flex gap-2 mt-3.5">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-[#588B8B]' : 'bg-[#E2E0D6]'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">
                    Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Client's full name"
                    className="rounded-xl border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#588B8B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2D3A3A]">
                      Age <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={e => update('age', e.target.value)}
                      placeholder="Age"
                      className="rounded-xl border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#588B8B]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2D3A3A]">
                      Gender <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      className="w-full border border-[#E2E0D6] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                      value={form.gender}
                      onChange={e => update('gender', e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2D3A3A]">Education</Label>
                    <select
                      className="w-full border border-[#E2E0D6] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                      value={form.education}
                      onChange={e => update('education', e.target.value)}
                    >
                      <option value="">Select Level</option>
                      <option value="High School">High School</option>
                      <option value="UG / Bachelor's">UG / Bachelor&apos;s</option>
                      <option value="PG / Master's">PG / Master&apos;s</option>
                      <option value="PhD / Doctorate">PhD / Doctorate</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2D3A3A]">Marital Status</Label>
                    <select
                      className="w-full border border-[#E2E0D6] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                      value={form.maritalStatus}
                      onChange={e => update('maritalStatus', e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Unmarried">Single / Unmarried</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Profession</Label>
                  <Input
                    value={form.profession}
                    onChange={e => update('profession', e.target.value)}
                    placeholder="e.g. Student, Engineer"
                    className="rounded-xl border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#588B8B]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Issues & Concerns */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-[#5A6B6B]">Select all issues that apply:</p>
                
                {/* Default Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ISSUE_OPTIONS.map((issue) => {
                    const selected = form.issues.includes(issue)
                    return (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => toggleIssue(issue)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? 'border-[#588B8B] bg-[#EDF4F2] text-[#263F3F] font-semibold shadow-2xs'
                            : 'border-[#E2E0D6] bg-white text-[#5A6B6B] hover:border-[#588B8B]/40 hover:bg-[#F6F5EE]'
                        }`}
                      >
                        {issue}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Added Issues Section */}
                {customIssues.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-[#588B8B] uppercase tracking-wide">
                      Additional / Custom Concerns Added:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {customIssues.map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EDF4F2] text-[#263F3F] border border-[#588B8B]"
                        >
                          <span>{custom}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomIssue(custom)}
                            className="w-4 h-4 rounded-full hover:bg-[#588B8B]/20 flex items-center justify-center text-[#588B8B] transition-colors"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Issue Input / Button */}
                <div className="pt-2">
                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#588B8B] bg-[#EDF4F2]/50 hover:bg-[#EDF4F2] text-[#263F3F] text-xs font-semibold transition-all hover:scale-[1.01]"
                    >
                      <Plus className="w-4 h-4 text-[#588B8B]" />
                      Add custom issue or specific concern
                    </button>
                  ) : (
                    <div className="p-3 bg-[#F6F5EE] border border-[#588B8B]/30 rounded-2xl space-y-2">
                      <Label className="text-xs font-semibold text-[#2D3A3A]">
                        Specify your concern or challenge:
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={customIssueInput}
                          onChange={e => setCustomIssueInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddCustomIssue()
                            }
                          }}
                          placeholder="e.g. Workplace burnout, Sleep disturbance, Social anxiety..."
                          className="rounded-xl border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2 focus:border-[#588B8B]"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            onClick={handleAddCustomIssue}
                            disabled={!customIssueInput.trim()}
                            className="rounded-xl bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-4 py-2 shadow-xs transition-colors"
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCustomInput(false)
                              setCustomIssueInput('')
                            }}
                            className="rounded-xl border-[#E2E0D6] text-xs font-semibold px-3 py-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Growth Track Checkbox */}
                <div className="pt-4 border-t border-[#E2E0D6]">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#588B8B] rounded"
                      checked={form.wantsGrowth}
                      onChange={e => update('wantsGrowth', e.target.checked)}
                    />
                    <span className="text-xs font-medium text-[#2D3A3A]">
                      Interested in Personality Development & Growth Track
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: SWOT Analysis */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-[#5A6B6B]">SWOT analysis (optional):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'swotStrengths', label: 'Strengths', placeholder: "Client's strengths..." },
                    { key: 'swotWeaknesses', label: 'Weaknesses', placeholder: "Client's weaknesses..." },
                    { key: 'swotOpportunities', label: 'Opportunities', placeholder: "Client's opportunities..." },
                    { key: 'swotThreats', label: 'Threats', placeholder: "Client's threats..." },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#2D3A3A]">{label}</Label>
                      <Textarea
                        rows={3}
                        className="resize-none text-xs rounded-xl border-[#E2E0D6] bg-white text-[#2D3A3A] p-3 focus:border-[#588B8B]"
                        placeholder={placeholder}
                        value={form[key as keyof typeof form] as string}
                        onChange={e => update(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E0D6]">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={step === 0 || submitting}
                className="rounded-full text-xs font-semibold px-5 py-2 border-[#E2E0D6] text-[#5A6B6B] hover:bg-[#F6F5EE]"
              >
                Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-6 py-2 shadow-xs transition-colors"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-6 py-2 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Save Client
                    </>
                  )}
                </Button>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center pt-6 text-xs text-[#5A6B6B]">
        CounsConnect Healthcare System • Confidential & Protected Health Information
      </footer>
    </div>
  )
}
