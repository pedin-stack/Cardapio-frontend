/**
 * @description Página inicial: o cliente chega pelo link/QR do restaurante (/{slug}); aqui é a porta do painel.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, ForkKnifeIcon } from "@phosphor-icons/react";

export default function InicioPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <motion.div
        aria-hidden
        className="absolute top-1/4 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-(--destaque)/25 blur-[120px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="relative grid size-20 place-items-center rounded-3xl gradiente-destaque shadow-[0_20px_60px_-10px_rgba(255,107,74,0.7)]"
      >
        <ForkKnifeIcon size={40} weight="fill" aria-hidden />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-8 font-display text-5xl font-bold tracking-tight texto-gradiente"
      >
        Cardápio
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-3 max-w-xs text-(--texto-suave)"
      >
        O cardápio que se navega como uma rede social.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="relative mt-10">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 rounded-full vidro-claro px-6 py-3 font-semibold transition hover:bg-white/15"
        >
          Entrar no painel
          <ArrowRightIcon size={18} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </motion.div>
    </main>
  );
}
