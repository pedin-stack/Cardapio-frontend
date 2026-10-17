import type { NextConfig } from "next";

// Imagens do cardápio vêm do Supabase Storage (bucket privado: URLs assinadas em /object/sign); o host sai da
// mesma variável do cliente.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// /api/* é repassado à API pelo src/middleware.ts (que também injeta o segredo do front).
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // O selo "N" de dev fica em cima da barra inferior do cardápio.
  devIndicators: false,
  output: "standalone",
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/sign/**" }]
      : [],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
