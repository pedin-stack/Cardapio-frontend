/**
 * @description Player HLS controlado pelo modo da janela de vídeos (ver `janelaVideos.ts`).
 * hls.js baixa os chunks .ts sob demanda: "descarregado" destrói a instância; "precarregar" mantém só ~1 chunk
 * em buffer (480p, `startLevel: 0`); "tocar" amplia o buffer e deixa o ABR subir para 720p.
 * Sem MSE (iOS antigo) usa o HLS nativo do Safari, com `preload` fazendo o papel do buffer.
 * O próprio hls.js é importado sob demanda: o cardápio pinta sem esperar o player.
 * Com `telaCheia`, um botão abre o vídeo em tela cheia (Fullscreen API; no iPhone, o player nativo).
 */
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type Hls from "hls.js";
import { CornersOutIcon } from "@phosphor-icons/react";

import { BUFFER_SEGUNDOS, type ModoVideo } from "./janelaVideos";

type HlsVideoProps = {
  src: string;
  poster?: string;
  modo: ModoVideo;
  mudo: boolean;
  className?: string;
  /** Classes de posição do botão de tela cheia; sem elas, não há botão. */
  telaCheia?: string;
};

/** iPhone não tem `requestFullscreen` em elementos: só o player nativo do próprio vídeo. */
type VideoWebkit = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export function HlsVideo({ src, poster, modo, mudo, className, telaCheia }: HlsVideoProps) {
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

  // Em tela cheia, os controles nativos (pausar, som, sair); na volta, o som segue o do cardápio.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !telaCheia) return;
    const aoTrocar = () => {
      const cheia = document.fullscreenElement === video;
      video.controls = cheia;
      if (!cheia) video.muted = mudo;
    };
    video.addEventListener("fullscreenchange", aoTrocar);
    video.addEventListener("webkitendfullscreen", aoTrocar);
    return () => {
      video.removeEventListener("fullscreenchange", aoTrocar);
      video.removeEventListener("webkitendfullscreen", aoTrocar);
    };
  }, [telaCheia, mudo]);

  const abrirTelaCheia = (evento: MouseEvent) => {
    // O toque no carrossel liga o som / curte.
    evento.stopPropagation();
    const video = videoRef.current as VideoWebkit | null;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen().catch(() => undefined);
    else video.webkitEnterFullscreen?.();
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <video
        ref={videoRef}
        // Em tela cheia, inteiro (o cover cortaria as bordas).
        className="absolute inset-0 size-full object-cover [&:fullscreen]:object-contain"
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
      {telaCheia && (
        <button
          type="button"
          onClick={abrirTelaCheia}
          aria-label="Ver vídeo em tela cheia"
          className={`absolute z-10 grid size-9 place-items-center rounded-full bg-black/35 text-white/85 backdrop-blur-sm ${telaCheia}`}
        >
          <CornersOutIcon size={18} weight="bold" aria-hidden />
        </button>
      )}
    </div>
  );
}
