import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join CounsConnect to manage your clinical practice.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
