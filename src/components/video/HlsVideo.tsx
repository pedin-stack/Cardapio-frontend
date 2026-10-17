/**
 * @description Player HLS controlado pelo modo da janela de vídeos (ver `janelaVideos.ts`).
 * hls.js baixa os chunks .ts sob demanda: "descarregado" destrói a instância; "precarregar" mantém só ~1 chunk
 * em buffer (480p, `startLevel: 0`); "tocar" amplia o buffer e deixa o ABR subir para 720p.
 * Sem MSE (iOS antigo) usa o HLS nativo do Safari, com `preload` fazendo o papel do buffer.
 * O próprio hls.js é importado sob demanda: o cardápio pinta sem esperar o player.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";

import { BUFFER_SEGUNDOS, type ModoVideo } from "./janelaVideos";

type HlsVideoProps = {
  src: string;
  poster?: string;
  modo: ModoVideo;
  mudo: boolean;
  className?: string;
};

export function HlsVideo({ src, poster, modo, mudo, className }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const modoRef = useRef(modo);
  const [tocando, setTocando] = useState(false);
  const carregado = modo !== "descarregado";

  /** Aplica buffer e play/pause do modo atual (chamado também quando o player termina de carregar). */
  const aplicarModo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const atual = modoRef.current;
    if (hlsRef.current) {
      hlsRef.current.config.maxBufferLength = Math.max(BUFFER_SEGUNDOS[atual], 1);
    } else {
      video.preload = atual === "tocar" || atual === "precarregar" ? "auto" : atual === "pausado" ? "metadata" : "none";
    }
    if (atual === "tocar") {
      // Autoplay só é garantido mudo; se o navegador recusar, o pôster continua e o toque inicia.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, []);

  // Cria/destrói a fonte. Depende só de src e de estar carregado: trocar entre tocar/precarregar/pausado
  // NÃO recria (o buffer já baixado é reaproveitado).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !carregado) return;
    let cancelado = false;

    import("hls.js").then(({ default: HlsJs }) => {
      if (cancelado) return;
      if (HlsJs.isSupported()) {
        const hls = new HlsJs({
          startLevel: 0,
          capLevelToPlayerSize: true,
          maxBufferLength: BUFFER_SEGUNDOS.precarregar,
          maxMaxBufferLength: 30,
          backBufferLength: 10,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else {
        video.src = src;
      }
      aplicarModo();
    });

    return () => {
      cancelado = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      } else if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
      setTocando(false);
    };
  }, [src, carregado, aplicarModo]);

  useEffect(() => {
    modoRef.current = modo;
    aplicarModo();
  }, [modo, aplicarModo]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = mudo;
  }, [mudo]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setTocando(true)}
        onPause={() => setTocando(false)}
        aria-hidden
      />
      {/* Pôster por cima até o 1º quadro: evita o "piscar" preto entre o pôster nativo e o vídeo. */}
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element -- pôster dinâmico do storage, só cobre o vídeo
        <img
          src={poster}
          alt=""
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500 ${tocando ? "opacity-0" : "opacity-100"}`}
        />
      )}
    </div>
  );
}
