/**
 * @description Upload direto do navegador ao Supabase Storage com URL assinada emitida pela API
 * (`MidiaController`). O caminho é gerado no servidor; a API só recebe o caminho de volta no formulário.
 * Tipo/tamanho checados aqui são contrato de UX; a defesa real são os limites do bucket.
 */
import { api } from "@/api/api";
import { supabase } from "@/api/supabaseClient";
import { env } from "@/config/env";

export type ArquivoEnviado = {
  caminho: string;
  url: string;
};

type UploadAssinado = {
  caminho: string;
  token: string;
};

/** Teto do vídeo original (o plano gratuito do Supabase limita 50 MB por arquivo). */
export const TAMANHO_MAXIMO_VIDEO_MB = 50;
/** Espelha `app.video.duracao-maxima-segundos` do backend. */
export const DURACAO_MAXIMA_VIDEO_S = 90;

/** POST /api/v1/core/midias/upload-assinado — CORE_MIDIA_CRIAR. Depois envia o arquivo ao bucket. */
export async function enviarArquivo(arquivo: File): Promise<ArquivoEnviado> {
  const { data } = await api.post<UploadAssinado>("/api/v1/core/midias/upload-assinado", { tipoConteudo: arquivo.type });
  const { error } = await supabase.storage
    .from(env.NEXT_PUBLIC_SUPABASE_BUCKET)
    .uploadToSignedUrl(data.caminho, data.token, arquivo, { contentType: arquivo.type });
  if (error) throw new Error("Falha ao enviar o arquivo. Tente novamente.");
  // Bucket privado: não há URL pública. A prévia usa o próprio arquivo (blob:); depois de salvo, a API devolve
  // URLs assinadas. ponytail: o blob não é revogado (some ao recarregar a página); revogar se o painel ficar
  // aberto o dia todo com centenas de uploads.
  return { caminho: data.caminho, url: URL.createObjectURL(arquivo) };
}

/** Prévia local (blob:) não passa pelo otimizador de imagem do Next, que só aceita URL remota. */
export function ehPreviaLocal(url: string): boolean {
  return url.startsWith("blob:");
}

/** Reduz a foto para WebP ≤ 1600 px (~800 KB): o feed carrega rápido em 4G. */
export async function comprimirImagem(arquivo: File): Promise<File> {
  const { default: compressao } = await import("browser-image-compression");
  return compressao(arquivo, { maxWidthOrHeight: 1600, maxSizeMB: 0.8, fileType: "image/webp", useWebWorker: true });
}

/** Duração do vídeo lida dos metadados no próprio navegador (antes de gastar banda com o upload). */
export function lerDuracaoVideo(arquivo: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler o vídeo."));
    };
    video.src = url;
  });
}
