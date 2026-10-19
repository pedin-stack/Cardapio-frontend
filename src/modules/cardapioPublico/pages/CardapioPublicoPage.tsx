/**
 * @description Cardápio público: cabeçalho com a logo e as redes do restaurante → hero (vídeo de fundo) → feed
 * vertical um-prato-por-tela, contínuo (as categorias em sequência, o chip acompanhando o prato na tela), com vídeo
 * HLS em janela, ou a lista com o vídeo no topo; aba Explorar (grade + busca),
 * curtidas como carrinho (com adicionais), identificação opcional do cliente para comentar e avaliar, rastreio de
 * tempo por item e a cor do restaurante.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { ServicoIndisponivel } from "@/components/ServicoIndisponivel";
import { EmptyState, ErrorState } from "@/components/UIStates";
import { calcularModosVideo } from "@/components/video/janelaVideos";

import { variaveisDoTema } from "@/utils/cor";

import { AbaCurtidos } from "../components/AbaCurtidos";
import { AbaExplorar } from "../components/AbaExplorar";
import { BarraNavegacao, type Aba } from "../components/BarraNavegacao";
import { CabecalhoCardapio, type ModoCardapio } from "../components/CabecalhoCardapio";
import { ChipsCategorias } from "../components/ChipsCategorias";
import { DetalheItemSheet } from "../components/DetalheItemSheet";
import { HeroRestaurante } from "../components/HeroRestaurante";
import { IdentificacaoSheet } from "../components/IdentificacaoSheet";
import { ItemFeedCard } from "../components/ItemFeedCard";
import { ListaCardapio, type SecaoLista } from "../components/ListaCardapio";
import { useCardapioPublico } from "../hooks/useCardapioPublico";
import { useCliente } from "../hooks/useCliente";
import { useCurtidos } from "../hooks/useCurtidos";
import { useRastreioVisualizacao } from "../hooks/useRastreioVisualizacao";
import type { CategoriaPublica, ItemPublico } from "../types/cardapioPublico";
import { categoriaVizinha } from "../utils/categoriaVizinha";
import { compartilharItem } from "../utils/compartilhar";

/** Índice "virtual" do hero no feed: nenhum card ativo. */
const INDICE_HERO = -1;
/** Categoria virtual com os mais curtidos (a API manda os ids já ordenados). */
const MAIS_PEDIDOS: CategoriaPublica = { id: "mais-pedidos", nome: "Mais pedidos", ordem: -1 };
/** Cards montados antes e depois do ativo; os outros ficam só com a casca (o feed contínuo passa de 200 pratos). */
const JANELA_MONTADA = 2;

export default function CardapioPublicoPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : undefined;
  const itemDoLink = typeof router.query.item === "string" ? router.query.item : undefined;
  const { cardapio, loading, indisponivel, erro, refetch } = useCardapioPublico(slug);
  const { curtidos, alternar, isCurtido, quantidade, escolhas, adicionais, definirQuantidade, escolher, alternarAdicional } = useCurtidos(slug);
  const cliente = useCliente(slug);

  const [indiceAtivo, setIndiceAtivo] = useState(INDICE_HERO);
  const [aba, setAba] = useState<Aba>("cardapio");
  const [modo, setModo] = useState<ModoCardapio>("feed");
  const [detalhe, setDetalhe] = useState<ItemPublico | null>(null);
  const [focarComentarios, setFocarComentarios] = useState(false);
  const [mudo, setMudo] = useState(true);

  const feed = useRef<HTMLElement>(null);
  const secoes = useRef(new Map<number, HTMLElement>());

  // "Mais pedidos" só existe quando há curtidas; vem antes das categorias reais (é onde o feed abre).
  const categoriasFeed = useMemo(
    () => (cardapio?.maisPedidos.length ? [MAIS_PEDIDOS, ...cardapio.categorias] : (cardapio?.categorias ?? [])),
    [cardapio],
  );
  const itensDa = useCallback(
    (categoriaId: string | null) => {
      const todos = cardapio?.itens ?? [];
      if (categoriaId === MAIS_PEDIDOS.id) {
        const porId = new Map(todos.map((item) => [item.id, item]));
        return (cardapio?.maisPedidos ?? []).map((id) => porId.get(id)).filter((item): item is ItemPublico => Boolean(item));
      }
      // Sem categorias no restaurante, mostra tudo.
      return todos.filter((item) => !categoriaId || item.categoriaIds.includes(categoriaId));
    },
    [cardapio],
  );
  // Lista e feed mostram as categorias em sequência, na ordem dos chips ("Mais pedidos" primeiro).
  const secoesCardapio = useMemo<SecaoLista[]>(
    () =>
      categoriasFeed.length === 0
        ? [{ categoria: { id: "cardapio", nome: "Cardápio", ordem: 0 }, itens: cardapio?.itens ?? [] }]
        : categoriasFeed.map((c) => ({ categoria: c, itens: itensDa(c.id) })).filter((secao) => secao.itens.length > 0),
    [categoriasFeed, cardapio, itensDa],
  );
  const categoriasDasSecoes = useMemo(() => secoesCardapio.map((secao) => secao.categoria), [secoesCardapio]);
  /** Feed contínuo: as seções uma atrás da outra (o mesmo prato pode estar em "Mais pedidos" e na categoria dele). */
  const feedItens = useMemo(
    () => secoesCardapio.flatMap(({ categoria, itens }) => itens.map((item) => ({ item, categoriaId: categoria.id }))),
    [secoesCardapio],
  );
  /** Categoria → índice do primeiro prato dela no feed (destino do chip e do deslize lateral). */
  const primeiroIndice = useMemo(() => {
    const mapa = new Map<string, number>();
    feedItens.forEach(({ categoriaId }, indice) => {
      if (!mapa.has(categoriaId)) mapa.set(categoriaId, indice);
    });
    return mapa;
  }, [feedItens]);
  // A categoria ativa é a do prato na tela (na capa, a primeira): os chips acompanham a rolagem, como na lista.
  const categoriaAtiva = feedItens[indiceAtivo]?.categoriaId ?? categoriasDasSecoes[0]?.id ?? null;
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
  }, [feedItens]);

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

  const irParaCategoria = (categoriaId: string) => {
    const destino = primeiroIndice.get(categoriaId);
    if (destino === undefined) return;
    // Longe, pula direto: rolar suave por dezenas de pratos montaria e desmontaria cada um no caminho.
    secoes.current.get(destino)?.scrollIntoView({ behavior: Math.abs(destino - indiceAtivo) <= JANELA_MONTADA ? "smooth" : "auto" });
  };

  const abrirDetalhe = (item: ItemPublico, comentarios = false) => {
    setFocarComentarios(comentarios);
    setDetalhe(item);
  };

  // Link compartilhado (/{slug}?item={id}): abre o detalhe do prato uma vez, quando o cardápio chega.
  const abriuLink = useRef(false);
  useEffect(() => {
    if (abriuLink.current || !cardapio || !itemDoLink) return;
    abriuLink.current = true;
    const item = cardapio.itens.find((i) => i.id === itemDoLink);
    if (item) setDetalhe(item);
  }, [cardapio, itemDoLink]);

  // Cor do restaurante: no <html> para alcançar também o que fica fora desta árvore (toasts, seleção de texto).
  const corDestaque = cardapio?.restaurante.corDestaque;
  useEffect(() => {
    if (!corDestaque) return;
    const estilo = document.documentElement.style;
    const variaveis = Object.entries(variaveisDoTema(corDestaque));
    variaveis.forEach(([nome, valor]) => estilo.setProperty(nome, valor));
    return () => variaveis.forEach(([nome]) => estilo.removeProperty(nome));
  }, [corDestaque]);

  const vizinhas = useMemo(
    () => ({
      proxima: categoriaVizinha(categoriasDasSecoes, categoriaAtiva, 1)?.nome,
      anterior: categoriaVizinha(categoriasDasSecoes, categoriaAtiva, -1)?.nome,
    }),
    [categoriasDasSecoes, categoriaAtiva],
  );

  const deslizarParaCategoria = (direcao: 1 | -1) => {
    const destino = categoriaVizinha(categoriasDasSecoes, categoriaAtiva, direcao);
    if (destino) irParaCategoria(destino.id);
  };

  const pausarVideos = Boolean(detalhe) || aba !== "cardapio" || modo === "lista";
  const modosVideo = useMemo(() => {
    const comVideo = feedItens.flatMap(({ item }, i) => (item.videoHlsUrl ? [i] : []));
    return calcularModosVideo(comVideo, indiceAtivo, pausarVideos);
  }, [feedItens, indiceAtivo, pausarVideos]);

  const itemEmFoco =
    detalhe?.id ?? (aba === "cardapio" && modo === "feed" && indiceAtivo >= 0 ? (feedItens[indiceAtivo]?.item.id ?? null) : null);
  useRastreioVisualizacao(slug, itemEmFoco);

  const itensCurtidos = useMemo(() => {
    const porId = new Map((cardapio?.itens ?? []).map((item) => [item.id, item]));
    return curtidos.map((id) => porId.get(id)).filter((item): item is ItemPublico => Boolean(item));
  }, [cardapio, curtidos]);

  if (indisponivel) return <ServicoIndisponivel />;
  if (erro) return <ErrorState mensagem={erro} onRetry={() => refetch()} />;
  if (loading || !cardapio || !slug) return <CardapioSkeleton />;

  const capaReserva = cardapio.itens.find((item) => item.imagens.length > 0)?.imagens[0];
  const compartilhar = (item: ItemPublico) => compartilharItem(item, slug, cardapio.restaurante.nome);
  // O detalhe acompanha o cardápio recarregado (média e contagens depois de avaliar ou comentar).
  const detalheAtual = detalhe ? (cardapio.itens.find((item) => item.id === detalhe.id) ?? detalhe) : null;

  return (
    <>
      <Head>
        <title>{`${cardapio.restaurante.nome} · Cardápio`}</title>
        {cardapio.restaurante.descricao && <meta name="description" content={cardapio.restaurante.descricao} />}
      </Head>

      <div className="min-h-svh bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--destaque)_12%,transparent),transparent_60%)]">
        <div className="relative mx-auto max-w-[480px] md:shadow-[0_0_120px_-20px_color-mix(in_srgb,var(--destaque)_25%,transparent)]">
          {/* Cabeçalho e, logo abaixo dele, a barra de categorias do feed (a lista tem a própria, que gruda ao rolar). */}
          <div className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto max-w-[480px]">
            <CabecalhoCardapio restaurante={cardapio.restaurante} modo={modo} onAlternarModo={() => setModo((m) => (m === "feed" ? "lista" : "feed"))} />
            {modo === "feed" && categoriasFeed.length > 0 && (
              <div className="mx-3">
                <ChipsCategorias
                  categorias={categoriasDasSecoes}
                  selecionada={categoriaAtiva}
                  onSelecionar={irParaCategoria}
                  visivel={indiceAtivo !== INDICE_HERO && aba === "cardapio"}
                />
              </div>
            )}
          </div>

          <main ref={feed} className="sem-scrollbar h-svh snap-y snap-mandatory overflow-y-auto overscroll-y-contain">
            <div ref={registrar(INDICE_HERO)} data-indice={INDICE_HERO}>
              <HeroRestaurante
                restaurante={cardapio.restaurante}
                capaReserva={capaReserva}
                videoAtivo={indiceAtivo === INDICE_HERO && !pausarVideos}
                container={feed}
                onComecar={irParaPrimeiroItem}
              />
            </div>

            {feedItens.length === 0 ? (
              <section ref={registrar(0)} data-indice={0} className="grid h-svh snap-start place-items-center">
                <EmptyState
                  icone={<MagnifyingGlassIcon size={48} weight="duotone" aria-hidden />}
                  titulo="Nenhum prato aqui ainda"
                  descricao="Volte em breve: o cardápio está sendo preparado."
                />
              </section>
            ) : (
              feedItens.map(({ item, categoriaId }, indice) => (
                <ItemFeedCard
                  key={`${categoriaId}:${item.id}`}
                  ref={registrar(indice)}
                  item={item}
                  indice={indice}
                  // Perto do ativo, ou com vídeo vivo na janela de vídeos (pré-carregando o próximo).
                  vivo={Math.abs(indice - indiceAtivo) <= JANELA_MONTADA || (modosVideo.get(indice) ?? "descarregado") !== "descarregado"}
                  ativo={indice === indiceAtivo}
                  modoVideo={modosVideo.get(indice) ?? "descarregado"}
                  curtido={isCurtido(item.id)}
                  mudo={mudo}
                  nomesCategorias={nomesDe(item)}
                  onAlternarCurtida={() => alternar(item.id)}
                  onAbrirDetalhe={() => abrirDetalhe(item)}
                  onComentar={() => abrirDetalhe(item, true)}
                  onCompartilhar={() => compartilhar(item)}
                  onAlternarSom={() => setMudo((m) => !m)}
                  vizinhas={vizinhas}
                  onDeslizarAlem={deslizarParaCategoria}
                />
              ))
            )}
          </main>

          <AnimatePresence>
            {modo === "lista" && (
              <ListaCardapio
                key="lista"
                restaurante={cardapio.restaurante}
                capaReserva={capaReserva}
                secoes={secoesCardapio}
                videoAtivo={aba === "cardapio" && !detalhe}
                onAbrir={(item) => abrirDetalhe(item)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {aba === "explorar" && (
              <AbaExplorar key="explorar" itens={cardapio.itens} categorias={cardapio.categorias} onAbrir={(item) => abrirDetalhe(item)} />
            )}
            {aba === "curtidos" && (
              <AbaCurtidos
                key="curtidos"
                itens={itensCurtidos}
                quantidade={quantidade}
                escolhas={escolhas}
                adicionais={adicionais}
                onDefinirQuantidade={definirQuantidade}
                onRemover={(id) => alternar(id)}
                onAbrir={(item) => abrirDetalhe(item)}
                onVoltarAoCardapio={() => setAba("cardapio")}
              />
            )}
          </AnimatePresence>

          <BarraNavegacao aba={aba} totalCurtidos={itensCurtidos.length} onTrocar={setAba} />

          <DetalheItemSheet
            item={detalheAtual}
            slug={slug}
            curtido={detalheAtual ? isCurtido(detalheAtual.id) : false}
            nomesCategorias={detalheAtual ? nomesDe(detalheAtual) : []}
            mudo={mudo}
            escolhas={detalheAtual ? escolhas(detalheAtual.id) : {}}
            onEscolher={(grupo, opcao) => detalheAtual && escolher(detalheAtual.id, grupo, opcao)}
            adicionais={detalheAtual ? adicionais(detalheAtual.id) : []}
            onAlternarAdicional={(adicionalId) => detalheAtual && alternarAdicional(detalheAtual.id, adicionalId)}
            cliente={cliente}
            focarComentarios={focarComentarios}
            onAlternarCurtida={() => detalheAtual && alternar(detalheAtual.id)}
            onCompartilhar={() => detalheAtual && compartilhar(detalheAtual)}
            onClose={() => setDetalhe(null)}
          />

          {/* Por último: abre por cima do detalhe quando comentar/avaliar pede identificação. */}
          <IdentificacaoSheet
            aberto={cliente.pedindo || (cliente.precisaDecidir && !detalhe)}
            formularioDireto={cliente.pedindo}
            restaurante={cardapio.restaurante.nome}
            cliente={cliente}
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
    </div>
  );
}
