import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Cloud
      { protocol: 'https', hostname: '**.supabase.co' },
      // Azure self-hosted — HTTP (pre-SSL, during development)
      { protocol: 'http', hostname: '*.azure.com' },
      { protocol: 'http', hostname: '*.cloudapp.azure.com' },
      // Azure self-hosted — HTTPS (after SSL is configured)
      { protocol: 'https', hostname: '*.azure.com' },
      { protocol: 'https', hostname: '*.cloudapp.azure.com' },
      // Custom domain on Azure
      { protocol: 'https', hostname: '*.yourdomain.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
};

export default nextConfig;
