/**
 * @description Seção da landing: rótulo, título, texto e conteúdo.
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { naTela, surgir } from "../constants/animacoes";

export function SecaoLanding({ id, rotulo, titulo, texto, children }: { id?: string; rotulo: string; titulo: string; texto: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
      <motion.div {...naTela} custom={0} variants={surgir} className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-(--principal-forte) uppercase">{rotulo}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{titulo}</h2>
        <p className="mt-4 text-(--texto-suave)">{texto}</p>
      </motion.div>
      {children}
    </section>
  );
}
