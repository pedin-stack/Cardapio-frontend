import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter, Sora } from "next/font/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { queryClient } from "@/api/queryClient";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Respeita "reduzir movimento" do sistema em todas as animações do framer-motion. */}
      <MotionConfig reducedMotion="user">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <title>Cardápio</title>
        </Head>
        <div className={`${inter.variable} ${sora.variable} font-sans`}>
          <Component {...pageProps} />
          <ToastContainer position="top-center" theme="dark" autoClose={3000} hideProgressBar newestOnTop />
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
