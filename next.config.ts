import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel Optimizations */
  
  // Image optimization — restrict to trusted hosts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com; font-src 'self' data:; connect-src 'self' https://mcp.supabase.com https://mcp.context7.com https://mcp.vercel.com https://vercel.live https://vitals.vercel-insights.com;",
          },
        ],
      },
    ];
  },

  // TypeScript strict mode
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // React strict mode for development
  reactStrictMode: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },
};

export default nextConfig;
