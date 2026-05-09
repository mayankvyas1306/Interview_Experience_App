import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to create a self-contained server in .next/standalone/
  // Without this, the Docker image would need ALL node_modules to run.
  // With this, it only bundles what's actually used.
  output: "standalone",
};

export default nextConfig;
