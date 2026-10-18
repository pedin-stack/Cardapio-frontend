/**
 * @description Um prato por tela, estilo Reels: mídia de ponta a ponta, informações sobre vidro fosco e
 * trilho de ações à direita. Dois toques na mídia curtem (com o coração gigante); um toque liga/desliga o som.
 */
import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon, InfoIcon, SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";

import type { ModoVideo } from "@/components/video/janelaVideos";
import { useToqueDuplo } from "@/hooks/useToqueDuplo";
import { formatarMoeda } from "@/utils/formatarMoeda";

import { BotaoCurtir } from "./BotaoCurtir";
import { CarrosselMidia } from "./CarrosselMidia";
import type { ItemPublico } from "../types/cardapioPublico";

type ItemFeedCardProps = {
  item: ItemPublico;
  indice: number;
  modoVideo: ModoVideo;
  ativo: boolean;
  curtido: boolean;
  mudo: boolean;
  nomesCategorias: string[];
  onAlternarCurtida: () => void;
  onAbrirDetalhe: () => void;
  onAlternarSom: () => void;
  /** Categorias vizinhas e a troca ao deslizar além das pontas do carrossel. */
  vizinhas?: { proxima?: string; anterior?: string };
  onDeslizarAlem?: (direcao: 1 | -1) => void;
};

export const ItemFeedCard = forwardRef<HTMLElement, ItemFeedCardProps>(function ItemFeedCard(
  { item, indice, modoVideo, ativo, curtido, mudo, nomesCategorias, onAlternarCurtida, onAbrirDetalhe, onAlternarSom, vizinhas, onDeslizarAlem },
  ref,
) {
  const [coracao, setCoracao] = useState(0);
  const temVideo = Boolean(item.videoHlsUrl);

  const aoToque = useToqueDuplo(
    () => (temVideo ? onAlternarSom() : onAbrirDetalhe()),
    () => {
      setCoracao((n) => n + 1);
      if (!curtido) onAlternarCurtida();
    },
  );

  return (
    <section
      ref={ref}
      data-indice={indice}
      aria-label={item.nome}
      className="relative h-svh w-full shrink-0 snap-start snap-always overflow-hidden bg-(--bg-elevado)"
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: ativo ? 1 : 1.06, opacity: ativo ? 1 : 0.6 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CarrosselMidia
          item={item}
          modoVideo={modoVideo}
          mudo={mudo}
          prioridade={indice === 0}
          onToque={aoToque}
          vizinhas={vizinhas}
          onDeslizarAlem={onDeslizarAlem}
        />
      </motion.div>

      {/* Escurece a base para o texto ficar legível sobre qualquer foto. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

      {/* Coração gigante do toque duplo. */}
      <AnimatePresence>
        {coracao > 0 && (
          <motion.div
            key={coracao}
            className="pointer-events-none absolute inset-0 grid place-items-center"
            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.25, 1, 1.1], rotate: [-15, 0, 0, 0] }}
            transition={{ duration: 0.9, times: [0, 0.3, 0.7, 1], ease: "easeOut" }}
            onAnimationComplete={() => setCoracao(0)}
          >
            <HeartIcon size={120} weight="fill" className="text-(--destaque) drop-shadow-[0_0_40px_color-mix(in_srgb,var(--destaque)_80%,transparent)]" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trilho de ações. */}
      <motion.div
        className="absolute right-4 bottom-[calc(env(safe-area-inset-bottom)+9rem)] z-10 flex flex-col items-center gap-4"
        initial={false}
        animate={{ opacity: ativo ? 1 : 0, x: ativo ? 0 : 16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <BotaoCurtir curtido={curtido} onAlternar={onAlternarCurtida} />
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={onAbrirDetalhe}
          aria-label={`Detalhes de ${item.nome}`}
          className="grid size-12 place-items-center rounded-full vidro-claro"
        >
          <InfoIcon size={24} weight="bold" aria-hidden />
        </motion.button>
        {temVideo && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={onAlternarSom}
            aria-label={mudo ? "Ativar som" : "Desativar som"}
            className="grid size-12 place-items-center rounded-full vidro-claro"
          >
            {mudo ? <SpeakerSlashIcon size={22} weight="bold" aria-hidden /> : <SpeakerHighIcon size={22} weight="bold" aria-hidden />}
          </motion.button>
        )}
      </motion.div>

      {/* Informações do prato. */}
      <motion.div
        // Termina antes do trilho de ações (right-20): com padding a caixa ainda cobria e roubava o toque do coração.
        className="absolute right-20 bottom-[calc(env(safe-area-inset-bottom)+6rem)] left-3"
        initial={false}
        animate={{ opacity: ativo ? 1 : 0.4, y: ativo ? 0 : 24 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <button type="button" onClick={onAbrirDetalhe} className="block w-full text-left">
          {nomesCategorias.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {nomesCategorias.slice(0, 3).map((nome) => (
                <span key={nome} className="rounded-full vidro-claro px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-white/90 uppercase">
                  {nome}
                </span>
              ))}
            </div>
          )}
          <h2 className="font-display text-[1.75rem] leading-tight font-semibold text-balance drop-shadow-lg">{item.nome}</h2>
          {item.descricao && <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{item.descricao}</p>}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full gradiente-destaque px-4 py-1.5 text-base font-semibold text-(--sobre-destaque) shadow-[0_8px_30px_-6px_color-mix(in_srgb,var(--destaque)_70%,transparent)]">
            {formatarMoeda(item.valor)}
          </div>
        </button>
      </motion.div>
    </section>
  );
});
