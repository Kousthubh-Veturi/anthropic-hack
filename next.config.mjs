/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for hackathon
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for hackathon
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

