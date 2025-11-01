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
    optimizePackageImports: ['lucide-react', '@solana/web3.js'], // Tree-shake unused code
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for 60 seconds
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Output optimization
  output: 'standalone', // Optimize for production deployment
};

export default nextConfig;
