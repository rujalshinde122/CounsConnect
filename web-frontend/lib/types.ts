// ============================================================
// TypeScript types that mirror the Supabase PostgreSQL schema
// Keep these in sync with the SQL in migration_to_supabase.md
// ============================================================

export type UserRole = 'counselor' | 'patient'

export interface Profile {
  id: string
  email: string
  name: string | null
  username: string | null
  role: UserRole
  phone: string | null
  place_of_stay: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  counselor_id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Transgender' | 'Other'
  education: string | null
  marital_status: 'Married' | 'Unmarried' | 'Divorced' | 'Widowed' | null
  profession: string | null
  issues: string[]
  symptoms: string[]
  wants_growth: boolean
  swot_strengths: string | null
  swot_weaknesses: string | null
  swot_opportunities: string | null
  swot_threats: string | null
  notes: string
  status: 'Active' | 'Inactive' | 'On Hold'
  created_at: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type AppointmentLocation = 'video' | 'in-person'

export interface Appointment {
  id: string
  counselor_id: string
  patient_id: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  location: AppointmentLocation
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  patient?: Pick<Profile, 'name' | 'email'>
  counselor?: Pick<Profile, 'name' | 'email'>
}

export type TaskStatus = 'pending' | 'completed' | 'missed' | 'overdue'
export type TaskFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'once'

export interface Task {
  id: string
  counselor_id: string
  patient_id: string
  title: string
  description: string | null
  frequency: TaskFrequency | null
  deadline: string | null
  status: TaskStatus
  feedback: string | null
  created_at: string
  updated_at: string
  // Joined
  patient?: Pick<Client, 'name'>
}

export interface CheckIn {
  id: string
  patient_id: string
  mood: string
  notes: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  type: 'text' | 'video-call-link' | 'system'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string | null
  is_read: boolean
  type: string | null
  created_at: string
}

export interface ClientClinicalHistory {
  client_id: string
  chief_complaints: string | null
  psychiatric_history: string | null
  medical_history: string | null
  family_history: string | null
  triggers: string | null
  current_medications: string | null
  risk_level: 'Low' | 'Medium' | 'High' | 'Crisis' | null
  allergies_or_precautions: string | null
  updated_at: string
}

export interface SessionNote {
  id: string
  client_id: string
  counselor_id: string
  session_number: number | null
  session_date: string
  duration_minutes: number
  modality: 'In-Person' | 'Virtual' | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  private_clinical_notes: string | null
  homework_assigned: string | null
  tags: string[] | null
  progress_rating: number | null
  created_at: string
  updated_at: string
}
