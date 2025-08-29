import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization for better Netlify compatibility
  output: 'standalone',

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

  // Configure rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
