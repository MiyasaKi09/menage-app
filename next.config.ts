import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Add experimental features here
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
