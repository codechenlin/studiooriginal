import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // 👈 evita problemas en build con imágenes externas
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.fanton.cloud" },
    ],
  },
  experimental: {
    // 👇 asegura que las páginas dinámicas no intenten exportarse
    forceSwcTransforms: true,
  },
};

export default nextConfig;
