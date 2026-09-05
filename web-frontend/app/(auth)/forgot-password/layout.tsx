import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your CounsConnect account password.',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
