/**
 * @description Uma imagem (logo ou capa) com envio assinado e prévia.
 */
import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { CircleNotchIcon, ImageIcon, XIcon } from "@phosphor-icons/react";

import { comprimirImagem, ehPreviaLocal, enviarArquivo, type ArquivoEnviado } from "@/actions/uploadService";
import { mensagemSeguraDeErro } from "@/api/mensagemErro";

type CampoImagemProps = {
  rotulo: string;
  dica: string;
  valor: ArquivoEnviado | null;
  formato: "quadrado" | "paisagem";
  /** Prévia inteira, sem cortar (logo horizontal). */
  inteira?: boolean;
  onChange: (valor: ArquivoEnviado | null) => void;
  onEnviando: (enviando: boolean) => void;
};

export function CampoImagem({ rotulo, dica, valor, formato, inteira, onChange, onEnviando }: CampoImagemProps) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const moldura = formato === "quadrado" ? "aspect-square w-28" : "aspect-[16/10] w-full";

  const aoSelecionar = async (arquivo: File | undefined) => {
    if (entrada.current) entrada.current.value = "";
    if (!arquivo) return;
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

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-(--texto-suave)">{rotulo}</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => entrada.current?.click()}
        aria-label={valor ? `Trocar ${rotulo.toLowerCase()}` : `Enviar ${rotulo.toLowerCase()}`}
        className={`relative ${moldura} overflow-hidden rounded-3xl border border-dashed border-(--borda-forte) text-(--texto-suave) transition hover:border-(--destaque) ${inteira && valor ? "bg-(--mc-noite)" : ""}`}
      >
        {enviando ? (
          <span className="absolute inset-0 grid place-items-center shimmer">
            <CircleNotchIcon size={24} className="animate-spin" aria-hidden />
          </span>
        ) : valor ? (
          <Image
            src={valor.url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            unoptimized={ehPreviaLocal(valor.url)}
            className={inteira ? "object-contain p-4" : "object-cover"}
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <ImageIcon size={26} aria-hidden />
            <span className="text-xs">Enviar</span>
          </span>
        )}
      </motion.button>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-(--texto-fraco)">{dica}</span>
        {valor && !enviando && (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-xs text-(--perigo)">
            <XIcon size={12} weight="bold" aria-hidden /> Remover
          </button>
        )}
      </div>
      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(evento) => aoSelecionar(evento.target.files?.[0])} />
    </div>
  );
}
