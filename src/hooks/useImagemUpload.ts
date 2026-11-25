/**
 * @description Comprime e envia uma imagem ao storage, avisando o formulário enquanto o envio dura.
 */
import { useState } from "react";
import { toast } from "react-toastify";

import { comprimirImagem, enviarArquivo, type ArquivoEnviado } from "@/actions/uploadService";
import { mensagemSeguraDeErro } from "@/api/mensagemErro";

export function useImagemUpload(onChange: (valor: ArquivoEnviado) => void, onEnviando: (enviando: boolean) => void) {
  const [enviando, setEnviando] = useState(false);

  const enviar = async (arquivo: File) => {
    setEnviando(true);
    onEnviando(true);
    try {
      onChange(await enviarArquivo(await comprimirImagem(arquivo)));
    } catch (erro) {
      toast.error(mensagemSeguraDeErro(erro, "Não foi possível enviar a imagem."));
    } finally {
      setEnviando(false);
      onEnviando(false);
    }
  };

  return { enviando, enviar };
}
