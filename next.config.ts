import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./prisma/"],
    "/": ["./prisma/"],
  },
};

export default nextConfig;
