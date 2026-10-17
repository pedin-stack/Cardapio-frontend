/**
 * @description Cardápio público (cliente, sem login): hero → feed vertical um-prato-por-tela com vídeo HLS em
 * janela, curtidas como carrinho e rastreio de tempo por item.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { ServicoIndisponivel } from "@/components/ServicoIndisponivel";
import { EmptyState, ErrorState } from "@/components/UIStates";
import { calcularModosVideo } from "@/components/video/janelaVideos";

import { AbaCurtidos } from "../components/AbaCurtidos";
import { BarraNavegacao, type Aba } from "../components/BarraNavegacao";
import { ChipsCategorias } from "../components/ChipsCategorias";
import { DetalheItemSheet } from "../components/DetalheItemSheet";
import { HeroRestaurante } from "../components/HeroRestaurante";
import { ItemFeedCard } from "../components/ItemFeedCard";
import { useCardapioPublico } from "../hooks/useCardapioPublico";
import { useCurtidos } from "../hooks/useCurtidos";
import { useRastreioVisualizacao } from "../hooks/useRastreioVisualizacao";
import type { ItemPublico } from "../types/cardapioPublico";

/** Índice "virtual" do hero no feed: nenhum card ativo. */
const INDICE_HERO = -1;

export default function CardapioPublicoPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : undefined;
  const { cardapio, loading, indisponivel, erro, refetch } = useCardapioPublico(slug);
  const { curtidos, alternar, isCurtido } = useCurtidos(slug);

  const [categoria, setCategoria] = useState<string | null>(null);
  const [indiceAtivo, setIndiceAtivo] = useState(INDICE_HERO);
  const [aba, setAba] = useState<Aba>("cardapio");
  const [detalhe, setDetalhe] = useState<ItemPublico | null>(null);
  const [mudo, setMudo] = useState(true);

  const feed = useRef<HTMLElement>(null);
  const secoes = useRef(new Map<number, HTMLElement>());

  const itens = useMemo(
    () => (cardapio?.itens ?? []).filter((item) => !categoria || item.categoriaIds.includes(categoria)),
    [cardapio, categoria],
  );
  const nomeCategoria = useMemo(
    () => new Map((cardapio?.categorias ?? []).map((c) => [c.id, c.nome])),
    [cardapio],
  );
  const nomesDe = useCallback(
    (item: ItemPublico) => item.categoriaIds.map((id) => nomeCategoria.get(id)).filter((n): n is string => Boolean(n)),
    [nomeCategoria],
  );

  // Card ativo = o que ocupa ≥ 60 % da tela (o hero conta como índice -1).
  useEffect(() => {
    const raiz = feed.current;
    if (!raiz) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setIndiceAtivo(Number((entrada.target as HTMLElement).dataset.indice));
        }
      },
      { root: raiz, threshold: 0.6 },
    );
    secoes.current.forEach((secao) => observador.observe(secao));
    return () => observador.disconnect();
  }, [itens]);

  const registrar = useCallback(
    (indice: number) => (elemento: HTMLElement | null) => {
      if (elemento) secoes.current.set(indice, elemento);
      else secoes.current.delete(indice);
    },
    [],
  );

  const irParaPrimeiroItem = useCallback(() => {
    secoes.current.get(0)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const trocarCategoria = (id: string | null) => {
    setCategoria(id);
    // Depois do re-render do feed filtrado, leva ao primeiro prato da categoria.
    requestAnimationFrame(() => secoes.current.get(0)?.scrollIntoView({ behavior: "smooth" }));
  };

  const pausarVideos = Boolean(detalhe) || aba === "curtidos";
  const modosVideo = useMemo(() => {
    const comVideo = itens.flatMap((item, i) => (item.videoHlsUrl ? [i] : []));
    return calcularModosVideo(comVideo, indiceAtivo, pausarVideos);
  }, [itens, indiceAtivo, pausarVideos]);

  const itemEmFoco = detalhe?.id ?? (aba === "cardapio" && indiceAtivo >= 0 ? (itens[indiceAtivo]?.id ?? null) : null);
  useRastreioVisualizacao(slug, itemEmFoco);

  const itensCurtidos = useMemo(() => {
    const porId = new Map((cardapio?.itens ?? []).map((item) => [item.id, item]));
    return curtidos.map((id) => porId.get(id)).filter((item): item is ItemPublico => Boolean(item));
  }, [cardapio, curtidos]);

  if (indisponivel) return <ServicoIndisponivel />;
  if (erro) return <ErrorState mensagem={erro} onRetry={() => refetch()} />;
  if (loading || !cardapio) return <CardapioSkeleton />;

  return (
    <>
      <Head>
        <title>{`${cardapio.restaurante.nome} · Cardápio`}</title>
        {cardapio.restaurante.descricao && <meta name="description" content={cardapio.restaurante.descricao} />}
      </Head>

      <div className="min-h-svh bg-[radial-gradient(circle_at_50%_0%,rgba(255,107,74,0.12),transparent_60%)]">
        <div className="relative mx-auto max-w-[480px] md:shadow-[0_0_120px_-20px_rgba(255,107,74,0.25)]">
          <div className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto max-w-[480px]">
            {cardapio.categorias.length > 0 && (
              <ChipsCategorias
                categorias={cardapio.categorias}
                selecionada={categoria}
                onSelecionar={trocarCategoria}
                visivel={indiceAtivo !== INDICE_HERO && aba === "cardapio"}
              />
            )}
          </div>

          <main ref={feed} className="sem-scrollbar h-svh snap-y snap-mandatory overflow-y-auto overscroll-y-contain">
            <div ref={registrar(INDICE_HERO)} data-indice={INDICE_HERO}>
              <HeroRestaurante
                restaurante={cardapio.restaurante}
                totalItens={cardapio.itens.length}
                totalCategorias={cardapio.categorias.length}
                capaReserva={cardapio.itens.find((item) => item.imagens.length > 0)?.imagens[0]}
                container={feed}
                onComecar={irParaPrimeiroItem}
              />
            </div>

            {itens.length === 0 ? (
              <section ref={registrar(0)} data-indice={0} className="grid h-svh snap-start place-items-center">
                <EmptyState
                  icone={<MagnifyingGlassIcon size={48} weight="duotone" aria-hidden />}
                  titulo="Nenhum prato aqui ainda"
                  descricao="Volte em breve: o cardápio está sendo preparado."
                />
              </section>
            ) : (
              itens.map((item, indice) => (
                <ItemFeedCard
                  key={item.id}
                  ref={registrar(indice)}
                  item={item}
                  indice={indice}
                  ativo={indice === indiceAtivo}
                  modoVideo={modosVideo.get(indice) ?? "descarregado"}
                  curtido={isCurtido(item.id)}
                  mudo={mudo}
                  nomesCategorias={nomesDe(item)}
                  onAlternarCurtida={() => alternar(item.id)}
                  onAbrirDetalhe={() => setDetalhe(item)}
                  onAlternarSom={() => setMudo((m) => !m)}
                />
              ))
            )}
          </main>

          <AnimatePresence>
            {aba === "curtidos" && (
              <AbaCurtidos
                itens={itensCurtidos}
                onRemover={(id) => alternar(id)}
                onAbrir={setDetalhe}
                onVoltarAoCardapio={() => setAba("cardapio")}
              />
            )}
          </AnimatePresence>

          <BarraNavegacao aba={aba} totalCurtidos={itensCurtidos.length} onTrocar={setAba} />

          <DetalheItemSheet
            item={detalhe}
            curtido={detalhe ? isCurtido(detalhe.id) : false}
            nomesCategorias={detalhe ? nomesDe(detalhe) : []}
            mudo={mudo}
            onAlternarCurtida={() => detalhe && alternar(detalhe.id)}
            onClose={() => setDetalhe(null)}
          />
        </div>
      </div>
    </>
  );
}

function CardapioSkeleton() {
  return (
    <div className="mx-auto flex h-svh max-w-[480px] flex-col justify-end gap-3 px-6 pb-32" role="status" aria-label="Carregando cardápio">
      <div className="mx-auto mb-4 size-24 rounded-[1.75rem] shimmer" />
      <div className="mx-auto h-10 w-3/4 rounded-full shimmer" />
      <div className="mx-auto h-4 w-1/2 rounded-full shimmer" />
      <div className="mx-auto mt-4 flex gap-2">
        <div className="h-6 w-20 rounded-full shimmer" />
        <div className="h-6 w-24 rounded-full shimmer" />
      </div>
    </div>
  );
}
