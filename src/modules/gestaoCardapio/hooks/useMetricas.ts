/**
 * @description Métricas do período e rankings paginados. Ao trocar o filtro, mantém o resultado anterior
 * (esmaecido) até o novo chegar — sem "piscar" esqueleto.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { buscarMetricas, buscarRanking } from "../services/metricaService";
import type { OrdemRanking, TipoRanking } from "../types/gestaoCardapio";

const POR_PAGINA_RANKING = 10;

/** AAAA-MM-DD no fuso do navegador (o back interpreta como data local do restaurante). */
function dataLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** Últimos `dias` dias, hoje incluso. */
function periodo(dias: number) {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(fim.getDate() - (dias - 1));
  return { inicio: dataLocal(inicio), fim: dataLocal(fim) };
}

export function useMetricas(dias: number, itemId: string | null) {
  const params = { ...periodo(dias), itemId: itemId ?? undefined };

  const query = useQuery({
    queryKey: ["metricas", params],
    queryFn: () => buscarMetricas(params),
    placeholderData: keepPreviousData,
  });

  return {
    metricas: query.data,
    loading: query.isPending,
    atualizando: query.isFetching && !query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar as métricas.") : null,
    refetch: query.refetch,
  };
}

export function useRankingMetrica(filtro: { tipo: TipoRanking; dias: number; categoriaId: string | null; ordem: OrdemRanking; page: number }) {
  const params = {
    tipo: filtro.tipo,
    ...periodo(filtro.dias),
    categoriaId: filtro.categoriaId ?? undefined,
    ordem: filtro.ordem,
    page: filtro.page,
    size: POR_PAGINA_RANKING,
  };

  const query = useQuery({
    queryKey: ["metricas", "ranking", params],
    queryFn: () => buscarRanking(params),
    placeholderData: keepPreviousData,
  });

  return {
    linhas: query.data?.content ?? [],
    totalPages: query.data?.totalPages ?? 0,
    loading: query.isPending,
    atualizando: query.isFetching && !query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar o ranking.") : null,
    refetch: query.refetch,
  };
}
