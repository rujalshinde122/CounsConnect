'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'

const ISSUE_OPTIONS = [
  'Exam fear', 'Future worries', 'Anxiety', 'Anger',
  'Depression', 'Loneliness', 'Relationship issues', 'Stress',
  'Grief', 'Self-esteem', 'Addiction', 'Trauma',
]

const STEPS = ['Personal Info', 'Issues & Concerns', 'SWOT Analysis']

export default function NewClientPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', age: '', gender: '', education: '',
    maritalStatus: '', profession: '',
    issues: [] as string[],
    wantsGrowth: false,
    swotStrengths: '', swotWeaknesses: '',
    swotOpportunities: '', swotThreats: '',
  })

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleIssue = (issue: string) => {
    update('issues', form.issues.includes(issue)
      ? form.issues.filter(i => i !== issue)
      : [...form.issues, issue])
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSubmitting(false); return }

    const { error: insertError } = await supabase.from('clients').insert({
      counselor_id: user.id,
      name: form.name, age: parseInt(form.age, 10), gender: form.gender,
      education: form.education || null, marital_status: form.maritalStatus || null,
      profession: form.profession || null, issues: form.issues, symptoms: [],
      wants_growth: form.wantsGrowth,
      swot_strengths: form.swotStrengths || null, swot_weaknesses: form.swotWeaknesses || null,
      swot_opportunities: form.swotOpportunities || null, swot_threats: form.swotThreats || null,
      notes: '', status: 'Active',
    })

    setSubmitting(false)
    if (insertError) setError(insertError.message)
    else { router.push('/dashboard/clients'); router.refresh() }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6B6B] hover:text-[#2D3A3A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clients
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
        {/* Card Header & Steps Indicator */}
        <div className="px-6 py-5 border-b border-[#E2E0D6] bg-[#F6F5EE]/40">
          <h2 className="text-sm font-bold text-[#2D3A3A]">Client Intake Form</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

          <div className="flex gap-1.5 mt-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1 rounded-sm transition-colors ${i <= step ? 'bg-[#588B8B]' : 'bg-[#E2E0D6]'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-lg font-medium">
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
                  className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2"
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
                    className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">
                    Gender <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                    value={form.gender}
                    onChange={e => update('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Transgender</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Education</Label>
                  <select
                    className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                    value={form.education}
                    onChange={e => update('education', e.target.value)}
                  >
                    <option value="">Select Level</option>
                    <option>High School</option>
                    <option>UG / Bachelor&apos;s</option>
                    <option>PG / Master&apos;s</option>
                    <option>PhD / Doctorate</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Marital Status</Label>
                  <select
                    className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
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
                  className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2"
                />
              </div>
            </div>
          )}

          {/* Step 2: Issues & Concerns */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-[#5A6B6B]">Select all issues that apply:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ISSUE_OPTIONS.map((issue) => {
                  const selected = form.issues.includes(issue)
                  return (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        selected
                          ? 'border-[#588B8B] bg-[#EDF4F2] text-[#263F3F]'
                          : 'border-[#E2E0D6] bg-white text-[#5A6B6B] hover:border-[#588B8B]/40 hover:bg-[#F6F5EE]'
                      }`}
                    >
                      {issue}
                    </button>
                  )
                })}
              </div>

              <div className="pt-3 border-t border-[#E2E0D6]">
                <label className="flex items-center gap-2.5 cursor-pointer">
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
                  { key: 'swotStrengths', label: 'Strengths' },
                  { key: 'swotWeaknesses', label: 'Weaknesses' },
                  { key: 'swotOpportunities', label: 'Opportunities' },
                  { key: 'swotThreats', label: 'Threats' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2D3A3A]">{label}</Label>
                    <Textarea
                      rows={3}
                      className="resize-none text-xs rounded-lg border-[#E2E0D6] bg-white text-[#2D3A3A] p-2.5"
                      value={form[key as keyof typeof form] as string}
                      onChange={e => update(key, e.target.value)}
                      placeholder={`Client's ${label.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E2E0D6]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="rounded-lg px-4 text-xs font-medium border-[#E2E0D6] text-[#5A6B6B]"
            >
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (step === 0 && (!form.name || !form.age || !form.gender)) {
                    setError('Name, age, and gender are required')
                    return
                  }
                  setError('')
                  setStep(s => s + 1)
                }}
                className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-lg px-5 text-xs font-semibold"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-lg px-5 text-xs font-semibold"
              >
                {submitting ? 'Saving...' : 'Save Client'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
