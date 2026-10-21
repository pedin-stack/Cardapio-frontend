/**
 * @description Página inicial: o cliente chega pelo link/QR do restaurante (/{slug}); aqui é a porta do painel.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@phosphor-icons/react";

import { Logo } from "@/components/Logo";

export default function InicioPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <motion.div
        aria-hidden
        className="absolute top-1/4 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-(--principal)/25 blur-[120px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.h1
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="relative"
      >
        <Logo className="text-5xl" />
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-5 max-w-xs text-(--texto-suave)"
      >
        O cardápio que se navega como uma rede social.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="relative mt-10">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 rounded-full gradiente-destaque px-6 py-3 font-semibold text-(--sobre-destaque) sombra-destaque"
        >
          Entrar no painel
          <ArrowRightIcon size={18} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </motion.div>
    </main>
  );
}
