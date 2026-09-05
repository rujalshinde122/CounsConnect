import { redirect } from 'next/navigation'

// Root page — middleware handles redirects to /dashboard or /login
// This only renders if middleware somehow doesn't catch it
export default function RootPage() {
  redirect('/dashboard')
}
