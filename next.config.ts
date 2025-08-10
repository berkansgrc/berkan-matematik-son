import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is to allow cross-origin requests in the development environment,
  // which is necessary for cloud-based IDEs like Firebase Studio.
  experimental: {
    // allowedDevOrigins was moved out of experimental in a newer Next.js version
  },
  allowedDevOrigins: [
    'https://*.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev',
  ],
};

export default nextConfig;
