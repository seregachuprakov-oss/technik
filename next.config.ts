import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Своих загруженных фото пока нет — только локальные SVG/иллюстрации.
    formats: ["image/webp"],
  },
};

export default nextConfig;
