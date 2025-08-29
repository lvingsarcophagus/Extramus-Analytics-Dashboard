import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure images for Netlify
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },

  // Experimental features for better compatibility
  experimental: {
    serverComponentsExternalPackages: ['pg', 'googleapis'],
  },

  // Configure headers for better caching and CORS
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
