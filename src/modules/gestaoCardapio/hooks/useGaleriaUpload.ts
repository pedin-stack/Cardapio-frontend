/**
 * @description Envio das fotos de um item, uma a uma, respeitando o limite; cada falha é avisada sem derrubar o lote.
 */
import { useState } from "react";
import { toast } from "react-toastify";

import { comprimirImagem, enviarArquivo } from "@/actions/uploadService";
import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { MAXIMO_IMAGENS } from "../schemas/itemCardapio.schema";
import type { Midia } from "../types/gestaoCardapio";

export function useGaleriaUpload(imagens: Midia[], onChange: (imagens: Midia[]) => void, onEnviando: (enviando: boolean) => void) {
  const [enviando, setEnviando] = useState(0);
  const vagas = MAXIMO_IMAGENS - imagens.length - enviando;

  const enviar = async (selecionados: File[]) => {
    if (selecionados.length === 0) return;
    if (selecionados.length > vagas) toast.info(`Só cabem mais ${Math.max(vagas, 0)} foto(s): o limite é ${MAXIMO_IMAGENS}.`);
    const lote = selecionados.slice(0, Math.max(vagas, 0));
    if (lote.length === 0) return;

    setEnviando((n) => n + lote.length);
    onEnviando(true);
    const enviadas: Midia[] = [];
    for (const arquivo of lote) {
      try {
        enviadas.push(await enviarArquivo(await comprimirImagem(arquivo)));
      } catch (erro) {
        toast.error(mensagemSeguraDeErro(erro, `Não foi possível enviar ${arquivo.name}.`));
      } finally {
        setEnviando((n) => n - 1);
      }
    }
    onEnviando(false);
    if (enviadas.length > 0) onChange([...imagens, ...enviadas].slice(0, MAXIMO_IMAGENS));
  };

  return { enviando, vagas, enviar };
}
