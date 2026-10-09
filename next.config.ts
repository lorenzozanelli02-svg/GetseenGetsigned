import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Serve modern formats; next/image resizes and compresses per device width.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
