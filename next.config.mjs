/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'identity.usc.edu',
      },
      {
        protocol: 'https',
        hostname: 'creative.uchicago.edu',
      },
      {
        protocol: 'https',
        hostname: 'ucomm.miami.edu',
      },
      {
        protocol: 'https',
        hostname: 'brand.virginia.edu',
      },
      {
        protocol: 'https',
        hostname: 'www.washington.edu',
      },
    ],
    unoptimized: false,
  },
  turbopack: {},
};

export default nextConfig;
