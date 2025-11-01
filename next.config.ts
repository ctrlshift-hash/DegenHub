import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence incorrect workspace root inference and fix dev chunk resolution
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  turbopack: {
    root: __dirname,
  },
  
  // Performance optimizations
  compress: true, // Enable gzip compression
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'], // Optimize icon imports
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
