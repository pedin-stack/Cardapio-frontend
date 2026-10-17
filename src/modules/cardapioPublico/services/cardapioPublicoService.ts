/**
 * @description Espelha `CardapioPublicoController`, `CurtidaController` e `VisualizacaoController` (rotas públicas).
 * O dispositivo vai no header `X-Device-ID`, injetado pelo interceptor da instância `api`.
 */
import { api } from "@/api/api";

import type { CardapioPublico, VisualizacaoItem } from "../types/cardapioPublico";

const restauranteApi = (slug: string) => `/api/v1/cardapio/restaurantes/restaurante/${encodeURIComponent(slug)}`;

/**
 * GET /api/v1/cardapio/restaurantes/restaurante/{slug} — público.
 * 404 = "Serviço indisponível" (restaurante inexistente ou desativado).
 */
export async function buscarCardapio(slug: string): Promise<CardapioPublico> {
  const { data } = await api.get<CardapioPublico>(restauranteApi(slug));
  return data;
}

/** PUT .../itens/item/{itemId}/curtida — público, idempotente. */
export async function curtirItem(slug: string, itemId: string): Promise<void> {
  await api.put(`${restauranteApi(slug)}/itens/item/${itemId}/curtida`);
}

/** DELETE .../itens/item/{itemId}/curtida — público, idempotente (vira "quase pedido" na métrica). */
export async function descurtirItem(slug: string, itemId: string): Promise<void> {
  await api.delete(`${restauranteApi(slug)}/itens/item/${itemId}/curtida`);
}

/**
 * POST .../visualizacoes — público. `keepalive` deixa o envio terminar mesmo com a página fechando
 * (sendBeacon não manda JSON cross-origin sem preflight).
 */
export async function enviarVisualizacoes(slug: string, itens: VisualizacaoItem[]): Promise<void> {
  await api.post(`${restauranteApi(slug)}/visualizacoes`, { itens }, { adapter: "fetch", fetchOptions: { keepalive: true } });
}
