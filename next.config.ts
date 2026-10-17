import type { NextConfig } from "next";

// Imagens do cardápio vêm do Supabase Storage; o host sai da mesma variável do cliente.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

/**
 * Origem da API (servidor, nunca exposta ao bundle). O navegador chama /api/* no próprio domínio do front e o
 * Next/Vercel repassa para cá: o cookie HttpOnly de sessão fica no domínio do front, então o login funciona mesmo
 * com front (*.vercel.app) e API (*.sslip.io) em sites diferentes.
 */
const apiOrigem = process.env.API_ORIGEM ?? (process.env.NODE_ENV === "production" ? undefined : "http://localhost:8080");
if (!apiOrigem) {
  throw new Error("Defina API_ORIGEM (ex.: https://api.seudominio.com) nas variáveis de ambiente do build.");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // O selo "N" de dev fica em cima da barra inferior do cardápio.
  devIndicators: false,
  output: "standalone",
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async rewrites() {
    return [{ source: "/api/:caminho*", destination: `${apiOrigem.replace(/\/+$/, "")}/api/:caminho*` }];
  },
};

export default nextConfig;
