import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React's View Transitions API integration for animated navigations,
  // shared-element morphs (hotel card → detail), and Suspense skeleton→content reveals.
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
