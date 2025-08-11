
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
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // This is to allow cross-origin requests in the development environment,
  // which is necessary for cloud-based IDEs like Firebase Studio.
  // The `allowedDevOrigins` property was moved out of `experimental` in newer Next.js versions.
  allowedDevOrigins: [
    'https://*.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev',
  ],
};

export default nextConfig;
