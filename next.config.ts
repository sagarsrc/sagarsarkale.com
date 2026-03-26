import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
