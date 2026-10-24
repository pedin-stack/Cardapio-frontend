/**
 * @description Métricas do período e rankings paginados. Ao trocar o filtro, mantém o resultado anterior
 * (esmaecido) até o novo chegar — sem "piscar" esqueleto.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { buscarMetricas, buscarRanking } from "../services/metricaService";
import type { OrdemRanking, TipoRanking } from "../types/gestaoCardapio";
import { ultimosDias, type Intervalo } from "../utils/periodos";

const POR_PAGINA_RANKING = 10;

export function useMetricas(intervalo: Intervalo, itemId: string | null = null) {
  const params = { inicio: intervalo.inicio, fim: intervalo.fim, itemId: itemId ?? undefined };

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
    ...ultimosDias(filtro.dias),
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
