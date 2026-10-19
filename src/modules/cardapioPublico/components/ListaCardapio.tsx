/**
 * @description Cardápio em lista: no topo, o vídeo do restaurante rodando (ou a capa); a barra de categorias gruda
 * abaixo do cabeçalho e acompanha a rolagem; cada seção lista nome, descrição, preço e foto. Fica por cima do feed,
 * que continua montado (e pausado) para a volta cair onde o cliente estava.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ForkKnifeIcon } from "@phosphor-icons/react";

import { HlsVideo } from "@/components/video/HlsVideo";
import { formatarMoeda } from "@/utils/formatarMoeda";

import { ChipsCategorias } from "./ChipsCategorias";
import { MediaEstrelas } from "./Estrelas";
import type { CategoriaPublica, ItemPublico, RestaurantePublico } from "../types/cardapioPublico";

export type SecaoLista = { categoria: CategoriaPublica; itens: ItemPublico[] };

type ListaCardapioProps = {
  restaurante: RestaurantePublico;
  capaReserva?: string;
  secoes: SecaoLista[];
  videoAtivo: boolean;
  onAbrir: (item: ItemPublico) => void;
};

export function ListaCardapio({ restaurante, capaReserva, secoes, videoAtivo, onAbrir }: ListaCardapioProps) {
  const rolagem = useRef<HTMLDivElement>(null);
  const titulos = useRef(new Map<string, HTMLElement>());
  const [ativa, setAtiva] = useState<string | null>(secoes[0]?.categoria.id ?? null);
  const capa = restaurante.capaUrl ?? capaReserva;

  // Chip ativo = a seção cujo título cruza a faixa logo abaixo da barra de categorias.
  useEffect(() => {
    const raiz = rolagem.current;
    if (!raiz) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setAtiva((entrada.target as HTMLElement).dataset.categoria ?? null);
        }
      },
      { root: raiz, rootMargin: "-20% 0px -70% 0px" },
    );
    titulos.current.forEach((titulo) => observador.observe(titulo));
    return () => observador.disconnect();
  }, [secoes]);

  const irPara = (categoriaId: string) => {
    setAtiva(categoriaId);
    titulos.current.get(categoriaId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const registrar = (categoriaId: string) => (elemento: HTMLElement | null) => {
    if (elemento) titulos.current.set(categoriaId, elemento);
    else titulos.current.delete(categoriaId);
  };

  return (
    <motion.div
      ref={rolagem}
      aria-label="Cardápio em lista"
      className="sem-scrollbar fixed inset-0 z-10 mx-auto max-w-[480px] overflow-y-auto overscroll-y-contain bg-(--bg) pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative h-[45svh] w-full overflow-hidden">
        {restaurante.videoHlsUrl ? (
          <HlsVideo
            src={restaurante.videoHlsUrl}
            poster={restaurante.videoPosterUrl ?? capa}
            modo={videoAtivo ? "tocar" : "pausado"}
            mudo
            className="size-full"
          />
        ) : capa ? (
          <Image src={capa} alt="" fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
        ) : (
          <div className="size-full bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--destaque)_55%,transparent),transparent_55%),#0b0b10]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-(--bg)" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-3">
          <h1 className="font-display text-3xl leading-tight font-bold texto-gradiente text-balance">{restaurante.nome}</h1>
          {restaurante.descricao && <p className="mt-1 text-sm text-white/75">{restaurante.descricao}</p>}
        </div>
      </div>

      {secoes.length > 1 && (
        <div className="sticky top-[calc(env(safe-area-inset-top)+3.75rem)] z-10 px-3 py-2">
          <ChipsCategorias categorias={secoes.map((secao) => secao.categoria)} selecionada={ativa} onSelecionar={irPara} visivel />
        </div>
      )}

      {secoes.map(({ categoria, itens }) => (
        <section key={categoria.id} aria-labelledby={`lista-${categoria.id}`} className="px-4 pt-5">
          <h2
            id={`lista-${categoria.id}`}
            ref={registrar(categoria.id)}
            data-categoria={categoria.id}
            className="scroll-mt-[calc(env(safe-area-inset-top)+7.5rem)] font-display text-xl font-semibold"
          >
            {categoria.nome}
          </h2>
          <ul className="mt-1 divide-y divide-white/8">
            {itens.map((item) => (
              <LinhaItem key={item.id} item={item} onAbrir={onAbrir} />
            ))}
          </ul>
        </section>
      ))}
    </motion.div>
  );
}

function LinhaItem({ item, onAbrir }: { item: ItemPublico; onAbrir: (item: ItemPublico) => void }) {
  const foto = item.imagens[0] ?? item.videoPosterUrl;
  return (
    <li>
      <button type="button" onClick={() => onAbrir(item)} className="flex w-full items-center gap-3 py-3 text-left">
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">{item.nome}</p>
          {item.descricao && <p className="mt-0.5 line-clamp-2 text-sm text-(--texto-suave)">{item.descricao}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3">
            <span className="font-semibold text-(--destaque)">{formatarMoeda(item.valor)}</span>
            <MediaEstrelas media={item.avaliacaoMedia} total={item.avaliacoes} className="text-xs" />
          </div>
        </div>
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-white/5">
          {foto ? (
            <Image src={foto} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <ForkKnifeIcon size={28} weight="thin" className="absolute inset-0 m-auto text-white/40" aria-hidden />
          )}
        </div>
      </button>
    </li>
  );
}
