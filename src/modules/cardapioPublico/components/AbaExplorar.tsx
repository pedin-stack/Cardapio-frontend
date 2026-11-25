/**
 * @description Aba "Explorar" (como a do Instagram): busca no topo e mosaico de fotos dos pratos com o nome no canto.
 * "Paginação mascarada": o cardápio já veio inteiro numa resposta; a grade mostra 9 e soma mais 9 quando o
 * cliente rola até perto do fim (as fotos só baixam quando entram na grade).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ForkKnifeIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

import { EmptyState } from "@/components/UIStates";

import { SeloMidia } from "./CarrosselMidia";
import type { CategoriaPublica, ItemPublico } from "../types/cardapioPublico";
import { buscarItens } from "../utils/buscaExplorar";

/** Itens por "página". */
const LOTE = 9;
/** Distância (px) do fim da grade que já conta como "chegou nos últimos". */
const PERTO_DO_FIM = 240;
/** Altura de cada linha do mosaico: blocos 3:4 em 3 colunas (o alto ocupa 2 linhas). */
const ALTURA_LINHA = "calc((min(100vw, 480px) - 4px) / 3 * 4 / 3)";

type AbaExplorarProps = {
  itens: ItemPublico[];
  categorias: CategoriaPublica[];
  onAbrir: (item: ItemPublico) => void;
};

export function AbaExplorar({ itens, categorias, onAbrir }: AbaExplorarProps) {
  const [termo, setTermo] = useState("");
  const [visiveis, setVisiveis] = useState(LOTE);
  const rolagem = useRef<HTMLDivElement>(null);

  const resultado = useMemo(() => buscarItens(itens, categorias, termo), [itens, categorias, termo]);
  const exibidos = resultado.slice(0, visiveis);
  const temMais = visiveis < resultado.length;

  // Busca nova recomeça do topo com um lote.
  useEffect(() => {
    setVisiveis(LOTE);
    rolagem.current?.scrollTo({ top: 0 });
  }, [termo]);

  // Só a rolagem do cliente pede mais: um observador no fim dispararia sozinho sempre que 9 não enchem a tela.
  const handleRolar = useCallback(() => {
    const el = rolagem.current;
    if (el && temMais && el.scrollTop + el.clientHeight >= el.scrollHeight - PERTO_DO_FIM) setVisiveis((v) => v + LOTE);
  }, [temMais]);

  // Tela alta demais para rolar: sem isso o cliente ficaria preso nos primeiros 9.
  useEffect(() => {
    const el = rolagem.current;
    if (el && temMais && el.scrollHeight <= el.clientHeight) setVisiveis((v) => v + LOTE);
  }, [temMais, visiveis]);

  return (
    <motion.section
      aria-label="Explorar"
      className="fixed inset-0 z-30 mx-auto flex max-w-[480px] flex-col bg-(--bg)/95 backdrop-blur-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
    >
      <header className="px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <label className="flex items-center gap-2 rounded-full vidro px-4 py-2.5 focus-within:ring-2 focus-within:ring-(--destaque)/70">
          <MagnifyingGlassIcon size={18} className="shrink-0 text-(--texto-suave)" aria-hidden />
          <span className="sr-only">Buscar no cardápio</span>
          <input
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar prato, categoria ou ingrediente"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-(--texto-fraco) [&::-webkit-search-cancel-button]:hidden"
          />
          {termo && (
            <button type="button" onClick={() => setTermo("")} aria-label="Limpar busca" className="grid size-6 place-items-center rounded-full bg-white/15">
              <XIcon size={12} weight="bold" aria-hidden />
            </button>
          )}
        </label>
      </header>

      <div ref={rolagem} onScroll={handleRolar} className="sem-scrollbar flex-1 overflow-y-auto pb-32">
        {resultado.length === 0 ? (
          <EmptyState
            icone={<MagnifyingGlassIcon size={48} weight="duotone" aria-hidden />}
            titulo="Nada encontrado"
            descricao={`Nenhum prato com "${termo.trim()}" no nome, na categoria ou nos ingredientes.`}
          />
        ) : (
          <>
            {/* Mosaico como o do Instagram (ver posicaoNoMosaico). `dense` encaixa os pequenos ao redor dos altos. */}
            <ul className="grid grid-flow-row-dense grid-cols-3 gap-0.5" style={{ gridAutoRows: ALTURA_LINHA }}>
              {exibidos.map((item, i) => (
                <BlocoExplorar key={item.id} item={item} posicao={posicaoNoMosaico(i)} atraso={(i % LOTE) * 0.035} onAbrir={onAbrir} />
              ))}
            </ul>
          </>
        )}
      </div>
    </motion.section>
  );
}

/**
 * Cada lote de 9 fecha 4 linhas inteiras (sem buraco entre lotes):
 *   [A][s][s]    A = alto (2 linhas), à esquerda nos lotes pares e à direita nos ímpares
 *   [A][s][s]
 *   [A][s][A]
 *   [A][s][A]
 */
function posicaoNoMosaico(i: number): string | undefined {
  const k = i % LOTE;
  if (k === 0) return Math.floor(i / LOTE) % 2 === 0 ? "row-span-2 col-start-1" : "row-span-2 col-start-3";
  if (k === 5) return "row-span-2 col-start-1";
  if (k === 7) return "row-span-2 col-start-3";
  return undefined;
}

type BlocoExplorarProps = {
  item: ItemPublico;
  /** Classes de grade do bloco alto (`posicaoNoMosaico`); os demais ocupam uma célula. */
  posicao?: string;
  atraso: number;
  onAbrir: (item: ItemPublico) => void;
};

function BlocoExplorar({ item, posicao, atraso, onAbrir }: BlocoExplorarProps) {
  const capa = item.imagens[0] ?? item.videoPosterUrl;
  const temVideo = Boolean(item.videoHlsUrl);

  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: atraso, duration: 0.35 }}
      className={posicao}
    >
      <button
        type="button"
        onClick={() => onAbrir(item)}
        className="relative block size-full overflow-hidden bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--destaque)"
      >
        {capa ? (
          <Image src={capa} alt="" fill sizes="(max-width: 480px) 33vw, 160px" className="object-cover transition-transform duration-500 active:scale-105" />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--destaque)_35%,transparent),transparent_60%)]">
            <ForkKnifeIcon size={32} weight="thin" className="text-white/40" aria-hidden />
          </div>
        )}
        {(temVideo || item.imagens.length > 0) && <SeloMidia video={temVideo} className="top-1.5 right-1.5 text-sm" />}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pt-6 pb-1.5 text-left text-xs leading-tight font-semibold">
          <span className="line-clamp-2">{item.nome}</span>
        </span>
      </button>
    </motion.li>
  );
}
