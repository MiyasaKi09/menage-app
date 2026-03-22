import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirects from old routes to new ones
  async redirects() {
    return [
      { source: '/dashboard', destination: '/maison', permanent: true },
      { source: '/household', destination: '/fief', permanent: true },
      { source: '/tasks', destination: '/maison', permanent: true },
      { source: '/tasks/:path*', destination: '/maison', permanent: true },
      { source: '/characters', destination: '/personnage', permanent: true },
    ]
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
