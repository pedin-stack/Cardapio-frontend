/**
 * @description Espelha `MetricaController` (/api/v1/cardapio/metricas).
 */
import { api } from "@/api/api";

import type { Metricas } from "../types/gestaoCardapio";

/**
 * GET /api/v1/cardapio/metricas?inicio&fim&itemId — CARDAPIO_METRICA_VISUALIZAR_PROPRIAS.
 * Datas AAAA-MM-DD (fim inclusive); itemId filtra só o mapa de calor.
 */
export async function buscarMetricas(params: { inicio: string; fim: string; itemId?: string }): Promise<Metricas> {
  const { data } = await api.get<Metricas>("/api/v1/cardapio/metricas", { params });
  return data;
}
