import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Devanagari } from 'next/font/google'
import { cookies } from 'next/headers'
import { LanguageProvider, Locale } from '@/context/LanguageContext'
import './globals.css'
import { cn } from "@/lib/utils"

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

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://counsconnect.centralindia.cloudapp.azure.com'),
  title: {
    default: 'CounsConnect — Clinical Practice & Therapy Management',
    template: '%s | CounsConnect',
  },
  description: 'Professional counseling management platform — connect counselors with patients seamlessly.',
  keywords: ['counseling', 'therapy', 'mental health', 'appointment scheduling', 'clinical practice'],
  openGraph: {
    title: 'CounsConnect — Clinical Practice & Therapy Management',
    description: 'Professional counseling management platform — connect counselors with patients seamlessly.',
    url: 'https://counsconnect.centralindia.cloudapp.azure.com',
    siteName: 'CounsConnect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CounsConnect — Clinical Practice & Therapy Management',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CounsConnect — Clinical Practice & Therapy Management',
    description: 'Professional counseling management platform — connect counselors with patients seamlessly.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('counsconnect_locale')?.value
  const locale: Locale = (rawLocale === 'hi' || rawLocale === 'mr' || rawLocale === 'en') ? rawLocale : 'en'

  return (
    <html lang={locale} suppressHydrationWarning className={cn("font-sans", jakarta.variable, inter.variable, devanagari.variable)}>
      <body className={`${jakarta.className} antialiased selection:bg-[#588B8B]/20 selection:text-[#2D3A3A]`}>
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

