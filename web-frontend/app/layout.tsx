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

