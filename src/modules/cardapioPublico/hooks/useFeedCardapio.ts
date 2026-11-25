/**
 * @description O cardápio organizado para o feed e a lista: categorias (com "Mais pedidos"), seções, itens em
 * sequência, o primeiro prato de cada categoria e os nomes das categorias de um prato.
 */
import { useCallback, useMemo } from "react";

import type { SecaoLista } from "../components/ListaCardapio";
import type { CardapioPublico, CategoriaPublica, ItemPublico } from "../types/cardapioPublico";

/** Categoria virtual com os mais curtidos (a API manda os ids já ordenados). */
const MAIS_PEDIDOS: CategoriaPublica = { id: "mais-pedidos", nome: "Mais pedidos", ordem: -1 };

export function useFeedCardapio(cardapio: CardapioPublico | undefined) {
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
  const nomeCategoria = useMemo(
    () => new Map((cardapio?.categorias ?? []).map((c) => [c.id, c.nome])),
    [cardapio],
  );
  const nomesDe = useCallback(
    (item: ItemPublico) => item.categoriaIds.map((id) => nomeCategoria.get(id)).filter((n): n is string => Boolean(n)),
    [nomeCategoria],
  );

  return { categoriasFeed, categoriasDasSecoes, secoesCardapio, feedItens, primeiroIndice, nomesDe };
}
