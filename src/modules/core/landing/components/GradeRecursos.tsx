/**
 * @description Grade de cartões de recurso (ícone, título e texto).
 */
import { motion } from "framer-motion";

import { naTela, surgir } from "../constants/animacoes";
import type { Recurso } from "../constants/conteudo";

export function GradeRecursos({
  recursos,
  colunas = "sm:grid-cols-2 lg:grid-cols-4",
  semMargem,
}: {
  recursos: Recurso[];
  colunas?: string;
  semMargem?: boolean;
}) {
  return (
    <ul className={`grid gap-4 ${colunas} ${semMargem ? "" : "mt-10"}`}>
      {recursos.map(({ Icone, titulo, texto }, i) => (
        <motion.li key={titulo} {...naTela} custom={i % 4} variants={surgir} className="rounded-3xl vidro p-5">
          <div className="grid size-11 place-items-center rounded-2xl bg-(--mc-menta)">
            <Icone size={22} weight="duotone" className="text-(--principal-forte)" aria-hidden />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{titulo}</h3>
          <p className="mt-1.5 text-sm text-(--texto-suave)">{texto}</p>
        </motion.li>
      ))}
    </ul>
  );
}
