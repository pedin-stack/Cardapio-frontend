/**
 * @description Cartão das métricas (título, subtítulo e conteúdo), com a entrada em cascata da tela.
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const surgirMetrica = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } }),
};

/** `largo`: ocupa as duas colunas no notebook/PC. */
export function CartaoMetrica({ indice, largo, titulo, subtitulo, children }: { indice: number; largo?: boolean; titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <motion.section
      custom={indice}
      variants={surgirMetrica}
      initial="oculto"
      animate="visivel"
      className={`rounded-3xl bg-(--bg-elevado) p-5 ring-1 ring-(--borda) ${largo ? "lg:col-span-2" : ""}`}
    >
      <h2 className="font-display text-base font-semibold">{titulo}</h2>
      <p className="mb-4 text-xs text-(--texto-fraco)">{subtitulo}</p>
      {children}
    </motion.section>
  );
}
