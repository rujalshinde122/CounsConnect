import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CounsConnect',
    template: '%s | CounsConnect',
  },
  description: 'Professional counseling management platform — connect counselors with patients seamlessly.',
  keywords: ['counseling', 'therapy', 'mental health', 'appointment scheduling'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", jakarta.variable, inter.variable)}>
      <body className={`${jakarta.className} antialiased selection:bg-[#588B8B]/20 selection:text-[#2D3A3A]`}>
        {children}
      </body>
    </html>
  )
}

