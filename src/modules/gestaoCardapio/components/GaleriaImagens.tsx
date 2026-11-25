/**
 * @description Até 8 fotos do item: envio com compressão (WebP), arrastar para reordenar (a 1ª é a capa)
 * e remover.
 */
import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { toast } from "react-toastify";
import { CircleNotchIcon, ImageSquareIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

import { comprimirImagem, ehPreviaLocal, enviarArquivo } from "@/actions/uploadService";
import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { MAXIMO_IMAGENS } from "../schemas/itemCardapio.schema";
import type { Midia } from "../types/gestaoCardapio";

type GaleriaImagensProps = {
  imagens: Midia[];
  onChange: (imagens: Midia[]) => void;
  onEnviando: (enviando: boolean) => void;
};

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

export function GaleriaImagens({ imagens, onChange, onEnviando }: GaleriaImagensProps) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(0);
  const vagas = MAXIMO_IMAGENS - imagens.length - enviando;

  const handleSelecionar = async (arquivos: FileList | null) => {
    const selecionados = Array.from(arquivos ?? []).filter((arquivo) => TIPOS_ACEITOS.includes(arquivo.type));
    if (entrada.current) entrada.current.value = "";
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-(--texto-suave)">Fotos</span>
        <span className="text-xs text-(--texto-fraco)">
          {imagens.length}/{MAXIMO_IMAGENS} · arraste para ordenar · a 1ª é a capa
        </span>
      </div>

      <div className="sem-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          <Reorder.Group axis="x" values={imagens} onReorder={onChange} className="flex gap-2">
            <AnimatePresence initial={false}>
              {imagens.map((imagem, i) => (
                <Reorder.Item
                  key={imagem.caminho}
                  value={imagem}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  whileDrag={{ scale: 1.08, zIndex: 10, boxShadow: "0 20px 40px -10px rgba(23,37,43,0.35)" }}
                  className="relative size-28 shrink-0 cursor-grab touch-pan-y overflow-hidden rounded-2xl bg-(--superficie) ring-1 ring-(--borda) active:cursor-grabbing"
                >
                  <Image src={imagem.url} alt={`Foto ${i + 1}`} fill sizes="112px" unoptimized={ehPreviaLocal(imagem.url)} className="pointer-events-none object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white font-bold tracking-wide uppercase backdrop-blur">
                      Capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(imagens.filter((outra) => outra.caminho !== imagem.caminho))}
                    aria-label={`Remover foto ${i + 1}`}
                    className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                  >
                    <XIcon size={14} weight="bold" aria-hidden />
                  </button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {Array.from({ length: enviando }, (_, i) => (
            <div key={`enviando-${i}`} className="grid size-28 shrink-0 place-items-center rounded-2xl shimmer" role="status" aria-label="Enviando foto">
              <CircleNotchIcon size={22} className="animate-spin text-(--texto-fraco)" aria-hidden />
            </div>
          ))}

          {vagas > 0 && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => entrada.current?.click()}
              className="flex size-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-(--borda-forte) text-(--texto-suave) transition hover:border-(--destaque) hover:text-(--texto)"
            >
              {imagens.length === 0 ? <ImageSquareIcon size={26} aria-hidden /> : <PlusIcon size={22} weight="bold" aria-hidden />}
              <span className="text-xs">Adicionar</span>
            </motion.button>
          )}
        </div>
      </div>

      <input
        ref={entrada}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        multiple
        hidden
        onChange={(evento) => handleSelecionar(evento.target.files)}
      />
    </div>
  );
}
