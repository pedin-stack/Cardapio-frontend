/**
 * @description Mídia do item em carrossel horizontal (vídeo primeiro, depois até 8 imagens).
 * CSS scroll-snap nativo (sem lib) + indicadores animados. Toque simples/duplo vem do pai. No feed, deslizar além
 * da última mídia (ou antes da primeira) troca de categoria.
 * ponytail: só toque; no desktop a troca de categoria fica com os chips.
 */
import { useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CaretLeftIcon, CaretRightIcon, ForkKnifeIcon } from "@phosphor-icons/react";

import { HlsVideo } from "@/components/video/HlsVideo";
import type { ModoVideo } from "@/components/video/janelaVideos";

import type { ItemPublico } from "../types/cardapioPublico";

type CarrosselMidiaProps = {
  item: ItemPublico;
  modoVideo: ModoVideo;
  mudo: boolean;
  prioridade?: boolean;
  onToque?: () => void;
  arredondado?: boolean;
  /** Categorias para onde o deslize além das pontas leva (nome exibido na dica). */
  vizinhas?: { proxima?: string; anterior?: string };
  /** Deslizou além da última (1) ou antes da primeira (-1) mídia. */
  onDeslizarAlem?: (direcao: 1 | -1) => void;
};

/** Distância (px) que o dedo precisa passar da ponta para trocar de categoria. */
const LIMIAR_DESLIZE = 70;

export function CarrosselMidia({ item, modoVideo, mudo, prioridade, onToque, arredondado, vizinhas, onDeslizarAlem }: CarrosselMidiaProps) {
  const trilho = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const temVideo = Boolean(item.videoHlsUrl);
  const total = (temVideo ? 1 : 0) + item.imagens.length;

  // Gesto além das pontas: o scroll nativo já parou, então lemos o dedo (touch*; pointer* é cancelado pelo scroll).
  // O slide é o do INÍCIO do toque: durante o gesto o scroll já atualiza `slide`, e passar da foto 1 para a
  // última não pode contar como "além da última".
  const gesto = useRef<{ x: number; y: number; slide: number } | null>(null);
  const [puxando, setPuxando] = useState<{ direcao: 1 | -1; progresso: number } | null>(null);

  const destinoDo = (inicio: { x: number; y: number; slide: number }, toque: { clientX: number; clientY: number }): 1 | -1 | null => {
    const dx = toque.clientX - inicio.x;
    if (Math.abs(dx) < Math.abs(toque.clientY - inicio.y) * 1.5) return null;
    if (dx < 0 && inicio.slide === total - 1 && vizinhas?.proxima) return 1;
    if (dx > 0 && inicio.slide === 0 && vizinhas?.anterior) return -1;
    return null;
  };

  const aoIniciarToque = (e: TouchEvent) => {
    gesto.current = onDeslizarAlem ? { x: e.touches[0].clientX, y: e.touches[0].clientY, slide } : null;
  };
  const aoMoverToque = (e: TouchEvent) => {
    if (!gesto.current) return;
    const direcao = destinoDo(gesto.current, e.touches[0]);
    const progresso = Math.min(1, Math.abs(e.touches[0].clientX - gesto.current.x) / LIMIAR_DESLIZE);
    setPuxando(direcao ? { direcao, progresso } : null);
  };
  const aoSoltarToque = (e: TouchEvent) => {
    const inicio = gesto.current;
    gesto.current = null;
    setPuxando(null);
    if (!inicio || !onDeslizarAlem) return;
    const direcao = destinoDo(inicio, e.changedTouches[0]);
    if (direcao && Math.abs(e.changedTouches[0].clientX - inicio.x) >= LIMIAR_DESLIZE) onDeslizarAlem(direcao);
  };

  const aoRolar = () => {
    const el = trilho.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (total === 0) {
    return (
      <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--destaque)_35%,transparent),transparent_60%),radial-gradient(circle_at_70%_80%,color-mix(in_srgb,var(--destaque-2)_25%,transparent),transparent_55%)]">
        <ForkKnifeIcon size={64} weight="thin" className="text-white/40" aria-hidden />
      </div>
    );
  }

  return (
    <div className={`relative size-full ${arredondado ? "overflow-hidden rounded-(--raio)" : ""}`}>
      <div
        ref={trilho}
        onScroll={aoRolar}
        onClick={onToque}
        onTouchStart={aoIniciarToque}
        onTouchMove={aoMoverToque}
        onTouchEnd={aoSoltarToque}
        onTouchCancel={() => setPuxando(null)}
        // Nas pontas, o deslize para fora do carrossel não é rolagem do navegador (só o nosso toque): senão o Chrome
        // o trata como "voltar"/"avançar" no histórico e tira o cliente do cardápio. pan-right = dedo para a esquerda.
        // Safari não tem pan-left/right: o valor é ignorado e vale o touch-manipulation da classe.
        style={{ touchAction: total <= 1 ? "pan-y" : slide === 0 ? "pan-right pan-y" : slide === total - 1 ? "pan-left pan-y" : "pan-x pan-y" }}
        className="sem-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-manipulation"
      >
        {temVideo && (
          <div className="relative size-full shrink-0 snap-center">
            <HlsVideo
              src={item.videoHlsUrl as string}
              poster={item.videoPosterUrl}
              // Vídeo fora da tela do carrossel não toca (mantém o buffer).
              modo={slide === 0 || modoVideo !== "tocar" ? modoVideo : "pausado"}
              mudo={mudo}
              className="size-full"
            />
          </div>
        )}
        {item.imagens.map((url, indice) => (
          <div key={url} className="relative size-full shrink-0 snap-center">
            <Image
              src={url}
              alt={`${item.nome} — foto ${indice + 1}`}
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
              priority={prioridade && indice === 0 && !temVideo}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dica do deslize além da ponta: acompanha o dedo e "acende" quando soltar já troca de categoria. */}
      {puxando && (
        <div
          className={`pointer-events-none absolute top-1/2 flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            puxando.direcao === 1 ? "right-3" : "left-3 flex-row-reverse"
          } ${puxando.progresso >= 1 ? "gradiente-destaque text-(--sobre-destaque)" : "vidro text-white"}`}
          style={{ opacity: 0.35 + puxando.progresso * 0.65, transform: `translateY(-50%) translateX(${(1 - puxando.progresso) * 24 * puxando.direcao}px)` }}
          aria-hidden
        >
          {puxando.direcao === 1 ? vizinhas?.proxima : vizinhas?.anterior}
          {puxando.direcao === 1 ? <CaretRightIcon size={16} weight="bold" /> : <CaretLeftIcon size={16} weight="bold" />}
        </div>
      )}

      {total > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4.25rem)] flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <motion.span
              key={i}
              animate={{ width: i === slide ? 18 : 6, opacity: i === slide ? 1 : 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-1.5 rounded-full bg-white"
            />
          ))}
        </div>
      )}
    </div>
  );
}
