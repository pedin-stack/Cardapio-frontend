/**
 * @description Espelha `MetricaController` (/api/v1/cardapio/metricas).
 */
import { api } from "@/api/api";
import type { Pagina } from "@/types/api";

import type { Metricas, OrdemRanking, RankingItem, TipoRanking } from "../types/gestaoCardapio";

/**
 * GET /api/v1/cardapio/metricas?inicio&fim&itemId — CARDAPIO_METRICA_VISUALIZAR_PROPRIAS.
 * Datas AAAA-MM-DD (fim inclusive); itemId filtra só o mapa de calor.
 */
export async function buscarMetricas(params: { inicio: string; fim: string; itemId?: string }): Promise<Metricas> {
  const { data } = await api.get<Metricas>("/api/v1/cardapio/metricas", { params });
  return data;
}

/** GET /ranking?tipo&inicio&fim&categoriaId&ordem&page&size — CARDAPIO_METRICA_VISUALIZAR_PROPRIAS. */
export async function buscarRanking(params: {
  tipo: TipoRanking;
  inicio: string;
  fim: string;
  categoriaId?: string;
  ordem: OrdemRanking;
  page: number;
  size: number;
}): Promise<Pagina<RankingItem>> {
  const { data } = await api.get<Pagina<RankingItem>>("/api/v1/cardapio/metricas/ranking", { params });
  return data;
}
