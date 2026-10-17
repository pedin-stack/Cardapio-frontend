/**
 * @description Espelha `RestauranteController` (/api/v1/core/restaurantes) — super admin.
 */
import { api } from "@/api/api";
import type { Pagina } from "@/types/api";

import type { Restaurante, RestauranteAtualizarPayload, RestaurantePayload } from "../types/restaurante";

const RESTAURANTE_API = "/api/v1/core/restaurantes";

/** GET ?nome&page&size — CORE_RESTAURANTE_VISUALIZAR_TODOS. Ordenado do mais novo. */
export async function listarRestaurantes(params: { nome?: string; page: number; size: number }): Promise<Pagina<Restaurante>> {
  const { data } = await api.get<Pagina<Restaurante>>(RESTAURANTE_API, { params });
  return data;
}

/** GET /restaurante/{id} — CORE_RESTAURANTE_VISUALIZAR_TODOS. Inclui o gestor. */
export async function buscarRestaurante(id: string): Promise<Restaurante> {
  const { data } = await api.get<Restaurante>(`${RESTAURANTE_API}/restaurante/${id}`);
  return data;
}

/** POST /restaurante — CORE_RESTAURANTE_CRIAR. 409: slug ou e-mail já em uso. */
export async function criarRestaurante(payload: RestaurantePayload): Promise<Restaurante> {
  const { data } = await api.post<Restaurante>(`${RESTAURANTE_API}/restaurante`, payload);
  return data;
}

/** PUT /restaurante/{id} — CORE_RESTAURANTE_ATUALIZAR. */
export async function atualizarRestaurante(id: string, payload: RestauranteAtualizarPayload): Promise<Restaurante> {
  const { data } = await api.put<Restaurante>(`${RESTAURANTE_API}/restaurante/${id}`, payload);
  return data;
}

/** PUT /restaurante/{id}/status — CORE_RESTAURANTE_ATUALIZAR. Desativado: cardápio responde "Serviço indisponível". */
export async function atualizarStatusRestaurante(id: string, ativo: boolean): Promise<Restaurante> {
  const { data } = await api.put<Restaurante>(`${RESTAURANTE_API}/restaurante/${id}/status`, { ativo });
  return data;
}

/** DELETE /restaurante/{id} — CORE_RESTAURANTE_APAGAR. Apaga gestor, cardápio e métricas. */
export async function excluirRestaurante(id: string): Promise<void> {
  await api.delete(`${RESTAURANTE_API}/restaurante/${id}`);
}
