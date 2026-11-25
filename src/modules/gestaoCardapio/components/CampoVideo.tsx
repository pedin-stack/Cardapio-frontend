/**
 * @description Vídeo curto (1 por item, ou o fundo da capa do restaurante). Valida tipo, tamanho e duração no navegador, envia o original
 * ao storage e mostra o status da transcodificação HLS (o back corta em chunks de 2 s em 480p/720p).
 */
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrashIcon, UploadSimpleIcon, VideoCameraIcon } from "@phosphor-icons/react";

import { DURACAO_MAXIMA_VIDEO_S, TAMANHO_MAXIMO_VIDEO_MB } from "@/actions/uploadService";
import { HlsVideo } from "@/components/video/HlsVideo";

import { StatusVideoBadge } from "./StatusVideoBadge";
import { TIPOS_VIDEO_ACEITOS, useVideoUpload } from "../hooks/useVideoUpload";
import type { ItemCardapioForm } from "../schemas/itemCardapio.schema";
import type { StatusVideo } from "../types/gestaoCardapio";

type CampoVideoProps = {
  rotulo?: string;
  video: ItemCardapioForm["video"];
  /** Status do vídeo já salvo (o recém-enviado ainda não tem). */
  status?: StatusVideo;
  onChange: (video: ItemCardapioForm["video"]) => void;
  onEnviando: (enviando: boolean) => void;
};

export function CampoVideo({ rotulo = "Vídeo", video, status, onChange, onEnviando }: CampoVideoProps) {
  const entrada = useRef<HTMLInputElement>(null);
  const { previa, enviando, enviar, descartarPrevia } = useVideoUpload(onChange, onEnviando);

  const handleSelecionar = (arquivo: File | undefined) => {
    if (entrada.current) entrada.current.value = "";
    if (arquivo) enviar(arquivo);
  };

  const novo = Boolean(previa);
  const statusExibido: StatusVideo | undefined = video ? (novo ? undefined : status) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-(--texto-suave)">{rotulo}</span>
        {statusExibido && <StatusVideoBadge status={statusExibido} />}
        {novo && <span className="text-xs text-(--aviso)">Será processado ao salvar</span>}
      </div>

      <AnimatePresence mode="wait">
        {enviando ? (
          <motion.div
            key="enviando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            className="flex aspect-[9/12] max-h-80 w-full flex-col items-center justify-center gap-3 rounded-3xl shimmer sm:w-60"
          >
            <UploadSimpleIcon size={28} className="animate-bounce" aria-hidden />
            <span className="text-sm text-(--texto-suave)">Enviando vídeo…</span>
          </motion.div>
        ) : video ? (
          <motion.div
            key={video.caminho}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative aspect-[9/12] max-h-80 w-full overflow-hidden rounded-3xl bg-black ring-1 ring-(--borda) sm:w-60"
          >
            {previa ? (
              <video src={previa} className="size-full object-cover" muted loop autoPlay playsInline />
            ) : video.hlsUrl ? (
              <HlsVideo src={video.hlsUrl} poster={video.posterUrl} modo="tocar" mudo className="size-full" />
            ) : (
              <div className="grid size-full place-items-center text-white/40">
                <VideoCameraIcon size={36} weight="duotone" aria-hidden />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                descartarPrevia();
                onChange(null);
              }}
              aria-label="Remover vídeo"
              className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
            >
              <TrashIcon size={16} weight="bold" aria-hidden />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="vazio"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => entrada.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-(--borda-forte) py-8 text-(--texto-suave) transition hover:border-(--destaque) hover:text-(--texto) sm:w-60"
          >
            <VideoCameraIcon size={30} weight="duotone" aria-hidden />
            <span className="text-sm font-medium">Adicionar vídeo</span>
            <span className="text-xs text-(--texto-fraco)">
              Vertical, até {DURACAO_MAXIMA_VIDEO_S} s e {TAMANHO_MAXIMO_VIDEO_MB} MB
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <input ref={entrada} type="file" accept={TIPOS_VIDEO_ACEITOS.join(",")} hidden onChange={(evento) => handleSelecionar(evento.target.files?.[0])} />
    </div>
  );
}
