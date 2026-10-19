/**
 * @description Espelha `AdicionalController` (/api/v1/cardapio/adicionais). Usa as permissões de item.
 */
import { api } from "@/api/api";
import type { Pagina } from "@/types/api";

import type { Adicional, AdicionalPayload } from "../types/gestaoCardapio";

const ADICIONAL_API = "/api/v1/cardapio/adicionais";

/** GET ?page&size — CARDAPIO_ITEM_VISUALIZAR_PROPRIOS. Os mais novos primeiro. */
export async function listarAdicionaisPagina(params: { page: number; size: number }): Promise<Pagina<Adicional>> {
  const { data } = await api.get<Pagina<Adicional>>(ADICIONAL_API, { params });
  return data;
}

/** POST /adicional — CARDAPIO_ITEM_CRIAR. 400 se algum item for de outro restaurante. */
export async function criarAdicional(payload: AdicionalPayload): Promise<Adicional> {
  const { data } = await api.post<Adicional>(`${ADICIONAL_API}/adicional`, payload);
  return data;
}

/** PUT /adicional/{id} — CARDAPIO_ITEM_ATUALIZAR. Substitui nome, valor e os itens. */
export async function atualizarAdicional(id: string, payload: AdicionalPayload): Promise<Adicional> {
  const { data } = await api.put<Adicional>(`${ADICIONAL_API}/adicional/${id}`, payload);
  return data;
}

/** DELETE /adicional/{id} — CARDAPIO_ITEM_APAGAR. Os itens só perdem o vínculo. */
export async function excluirAdicional(id: string): Promise<void> {
  await api.delete(`${ADICIONAL_API}/adicional/${id}`);
}
