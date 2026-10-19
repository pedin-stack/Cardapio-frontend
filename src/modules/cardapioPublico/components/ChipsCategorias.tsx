/**
 * @description Barra de categorias em vidro fosco com indicador que desliza entre os chips (layoutId). A categoria
 * ativa acompanha a rolagem (feed e lista) e a barra rola sozinha para deixar o chip ativo à vista.
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import type { CategoriaPublica } from "../types/cardapioPublico";

type ChipsCategoriasProps = {
  categorias: CategoriaPublica[];
  selecionada: string | null;
  onSelecionar: (categoriaId: string) => void;
  visivel: boolean;
};

export function ChipsCategorias({ categorias, selecionada, onSelecionar, visivel }: ChipsCategoriasProps) {
  const barra = useRef<HTMLUListElement>(null);

  // Centraliza o chip ativo. scrollBy na própria barra (e não scrollIntoView, que também rolaria o feed/lista).
  useEffect(() => {
    const lista = barra.current;
    const chip = lista?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!lista || !chip) return;
    const caixa = lista.getBoundingClientRect();
    const alvo = chip.getBoundingClientRect();
    lista.scrollBy({ left: alvo.left - caixa.left - (caixa.width - alvo.width) / 2, behavior: "smooth" });
  }, [selecionada]);

  return (
    // A posição vem do pai (abaixo do cabeçalho). Escondida, some para trás dele e não intercepta o toque.
    <motion.nav
      aria-label="Categorias"
      aria-hidden={!visivel}
      initial={false}
      animate={{ y: visivel ? 0 : -24, opacity: visivel ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className={`rounded-full vidro p-1 ${visivel ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* layoutScroll: o indicador anima certo mesmo com a barra rolando. */}
      <motion.ul ref={barra} layoutScroll className="sem-scrollbar flex gap-1 overflow-x-auto">
        {categorias.map((opcao) => {
          const ativa = selecionada === opcao.id;
          return (
            <li key={opcao.id} className="shrink-0">
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
      </motion.ul>
    </motion.nav>
  );
}
