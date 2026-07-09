import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["./prisma/"],
      "/": ["./prisma/"],
    },
  },
};

export default nextConfig;
