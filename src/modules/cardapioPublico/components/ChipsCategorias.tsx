/**
 * @description Barra de categorias em vidro fosco com indicador que desliza entre os chips (layoutId).
 */
import { motion } from "framer-motion";

import type { CategoriaPublica } from "../types/cardapioPublico";

type ChipsCategoriasProps = {
  categorias: CategoriaPublica[];
  selecionada: string | null;
  onSelecionar: (categoriaId: string | null) => void;
  visivel: boolean;
};

export function ChipsCategorias({ categorias, selecionada, onSelecionar, visivel }: ChipsCategoriasProps) {
  const opcoes = [{ id: null, nome: "Tudo" }, ...categorias];

  return (
    <motion.nav
      aria-label="Categorias"
      initial={false}
      animate={{ y: visivel ? 0 : -80, opacity: visivel ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="pointer-events-auto mx-3 mt-[calc(env(safe-area-inset-top)+0.75rem)] rounded-full vidro p-1"
    >
      <ul className="sem-scrollbar flex gap-1 overflow-x-auto">
        {opcoes.map((opcao) => {
          const ativa = selecionada === opcao.id;
          return (
            <li key={opcao.id ?? "tudo"} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelecionar(opcao.id)}
                aria-pressed={ativa}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${ativa ? "text-(--sobre-destaque)" : "text-white/65"}`}
              >
                {ativa && (
                  <motion.span
                    layoutId="chip-ativo"
                    className="absolute inset-0 rounded-full gradiente-destaque"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{opcao.nome}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
