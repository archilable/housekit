import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.googleusercontent.com' }],
  },
  experimental: {
    optimizePackageImports: ['@vercel/analytics'],
  },
};

export default nextConfig;
