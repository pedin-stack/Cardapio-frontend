/**
 * @description Mídia do item em carrossel horizontal (vídeo primeiro, depois até 8 imagens).
 * CSS scroll-snap nativo (sem lib) + indicadores animados. Toque simples/duplo vem do pai.
 */
import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ForkKnifeIcon } from "@phosphor-icons/react";

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
};

export function CarrosselMidia({ item, modoVideo, mudo, prioridade, onToque, arredondado }: CarrosselMidiaProps) {
  const trilho = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const temVideo = Boolean(item.videoHlsUrl);
  const total = (temVideo ? 1 : 0) + item.imagens.length;

  const aoRolar = () => {
    const el = trilho.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (total === 0) {
    return (
      <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,74,0.35),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(255,179,107,0.25),transparent_55%)]">
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
