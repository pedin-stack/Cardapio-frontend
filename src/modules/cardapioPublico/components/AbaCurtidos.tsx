/**
 * @description Aba "Curtidos" — o carrinho do cardápio: lista os curtidos (mais recente primeiro) com total.
 * Arrastar para a esquerda (ou o X) remove = descurtir.
 */
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ForkKnifeIcon, HeartBreakIcon, XIcon } from "@phosphor-icons/react";

import { EmptyState } from "@/components/UIStates";
import { formatarMoeda } from "@/utils/formatarMoeda";

import type { ItemPublico } from "../types/cardapioPublico";

type AbaCurtidosProps = {
  itens: ItemPublico[];
  onRemover: (itemId: string) => void;
  onAbrir: (item: ItemPublico) => void;
  onVoltarAoCardapio: () => void;
};

export function AbaCurtidos({ itens, onRemover, onAbrir, onVoltarAoCardapio }: AbaCurtidosProps) {
  const total = itens.reduce((soma, item) => soma + item.valor, 0);

  return (
    <motion.section
      aria-label="Curtidos"
      className="fixed inset-0 z-30 mx-auto flex max-w-[480px] flex-col bg-(--bg)/95 backdrop-blur-2xl"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
    >
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4">
        <h1 className="font-display text-3xl font-bold">Curtidos</h1>
        <p className="mt-1 text-sm text-(--texto-suave)">Mostre ao garçom o que você quer pedir.</p>
      </header>

      {itens.length === 0 ? (
        <EmptyState
          icone={<HeartBreakIcon size={52} weight="duotone" aria-hidden />}
          titulo="Nada curtido ainda"
          descricao="Toque no coração (ou dê dois toques na foto) dos pratos que chamarem sua atenção."
          acao={
            <button type="button" onClick={onVoltarAoCardapio} className="rounded-full gradiente-destaque px-6 py-2.5 text-sm font-semibold">
              Explorar o cardápio
            </button>
          }
        />
      ) : (
        <>
          <ul className="sem-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-48">
            <AnimatePresence initial={false}>
              {itens.map((item, i) => (
                <CurtidoLinha key={item.id} item={item} indice={i} onRemover={onRemover} onAbrir={onAbrir} />
              ))}
            </AnimatePresence>
          </ul>

          <motion.div
            layout
            className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] mx-auto w-[calc(100%-2rem)] max-w-[22rem] rounded-3xl vidro px-5 py-4"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-(--texto-suave)">
                {itens.length} {itens.length === 1 ? "item" : "itens"}
              </span>
              <motion.span key={total} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-2xl font-bold">
                {formatarMoeda(total)}
              </motion.span>
            </div>
          </motion.div>
        </>
      )}
    </motion.section>
  );
}

type CurtidoLinhaProps = {
  item: ItemPublico;
  indice: number;
  onRemover: (itemId: string) => void;
  onAbrir: (item: ItemPublico) => void;
};

function CurtidoLinha({ item, indice, onRemover, onAbrir }: CurtidoLinhaProps) {
  const miniatura = item.imagens[0] ?? item.videoPosterUrl;

  const aoSoltar = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -110 || info.velocity.x < -700) onRemover(item.id);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: indice * 0.04 } }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
      className="relative"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.7, right: 0 }}
        onDragEnd={aoSoltar}
        className="flex items-center gap-3 rounded-2xl vidro-claro p-2.5 pr-3"
      >
        <button type="button" onClick={() => onAbrir(item)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
            {miniatura ? (
              <Image src={miniatura} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <ForkKnifeIcon size={24} className="absolute inset-0 m-auto text-white/40" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{item.nome}</p>
            <p className="text-sm text-(--destaque)">{formatarMoeda(item.valor)}</p>
          </div>
        </button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => onRemover(item.id)}
          aria-label={`Remover ${item.nome} dos curtidos`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"
        >
          <XIcon size={16} weight="bold" aria-hidden />
        </motion.button>
      </motion.div>
    </motion.li>
  );
}
