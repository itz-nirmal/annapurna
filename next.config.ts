import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    // Enable faster builds and hot reloads
    optimizeServerReact: true,
  },
  
    
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600,
  },
  
  // Enable compression
  compress: true,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Development optimizations for faster compilation
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 200, // Reduced from 300
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      
      // Optimize for faster rebuilds
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Enable faster source maps in development
      config.devtool = 'eval-cheap-module-source-map';
    }

    // Optimize bundle splitting
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

export default nextConfig;