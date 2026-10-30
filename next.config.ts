import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Login Server Function arguments contain credentials.
  logging: { serverFunctions: false },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
