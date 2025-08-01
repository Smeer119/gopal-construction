/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable server-side features
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Configure webpack to handle certain Node.js modules
  webpack: (config) => {
    // This is needed for some dependencies that use Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    };
    return config;
  },
};

// Only enable static export in production
// if (process.env.NODE_ENV === 'production') {
//   nextConfig.output = 'export';
//   nextConfig.images.unoptimized = true;
// }

module.exports = nextConfig;
