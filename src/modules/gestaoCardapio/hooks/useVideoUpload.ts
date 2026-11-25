/**
 * @description Valida tipo, tamanho e duração no navegador, envia o vídeo original ao storage e guarda a prévia local.
 */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { DURACAO_MAXIMA_VIDEO_S, TAMANHO_MAXIMO_VIDEO_MB, enviarArquivo, lerDuracaoVideo } from "@/actions/uploadService";
import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import type { ItemCardapioForm } from "../schemas/itemCardapio.schema";

export const TIPOS_VIDEO_ACEITOS = ["video/mp4", "video/quicktime", "video/webm"];

export function useVideoUpload(onChange: (video: ItemCardapioForm["video"]) => void, onEnviando: (enviando: boolean) => void) {
  const [previa, setPrevia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const enviar = async (arquivo: File) => {
    if (!TIPOS_VIDEO_ACEITOS.includes(arquivo.type)) {
      toast.error("Use um vídeo MP4, MOV ou WebM.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_VIDEO_MB * 1024 * 1024) {
      toast.error(`O vídeo deve ter até ${TAMANHO_MAXIMO_VIDEO_MB} MB.`);
      return;
    }
    try {
      if ((await lerDuracaoVideo(arquivo)) > DURACAO_MAXIMA_VIDEO_S) {
        toast.error(`O vídeo deve ter até ${DURACAO_MAXIMA_VIDEO_S} segundos.`);
        return;
      }
      setEnviando(true);
      onEnviando(true);
      const enviado = await enviarArquivo(arquivo);
      // enviado.url já é a prévia local (blob:) do arquivo.
      setPrevia(enviado.url);
      onChange({ caminho: enviado.caminho, url: enviado.url });
    } catch (erro) {
      toast.error(mensagemSeguraDeErro(erro, "Não foi possível enviar o vídeo."));
    } finally {
      setEnviando(false);
      onEnviando(false);
    }
  };

  return { previa, enviando, enviar, descartarPrevia: () => setPrevia(null) };
}
