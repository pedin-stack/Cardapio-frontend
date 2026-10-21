import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fredoka, Inter } from "next/font/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { queryClient } from "@/api/queryClient";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });

export default function App({ Component, pageProps }: AppProps) {
  // Só o cardápio público (feed de fotos e vídeos) é escuro; o resto do MenuClip é claro.
  const escuro = useRouter().pathname === "/[slug]";
  return (
    <QueryClientProvider client={queryClient}>
      {/* Respeita "reduzir movimento" do sistema em todas as animações do framer-motion. */}
      <MotionConfig reducedMotion="user">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content={escuro ? "#0a1519" : "#f5f5f5"} />
          <meta name="color-scheme" content={escuro ? "dark" : "light"} />
          <title>MenuClip</title>
        </Head>
        <div className={`${inter.variable} ${fredoka.variable} font-sans ${escuro ? "tema-escuro" : ""}`}>
          <Component {...pageProps} />
          <ToastContainer position="top-center" theme={escuro ? "dark" : "light"} autoClose={3000} hideProgressBar newestOnTop />
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
