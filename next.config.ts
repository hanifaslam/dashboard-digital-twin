import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-storage-digital-twin.hanifaslam.dev",
      },
      {
        protocol: "https",
        hostname: "storage-digital-twin.hanifaslam.dev",
      },
    ],
  },
};

export default nextConfig;
