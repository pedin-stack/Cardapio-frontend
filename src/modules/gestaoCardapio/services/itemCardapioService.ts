/**
 * @description Espelha `ItemCardapioController` (/api/v1/cardapio/itens).
 */
import { api } from "@/api/api";

import type { ItemCardapio, ItemCardapioPayload } from "../types/gestaoCardapio";

const ITEM_API = "/api/v1/cardapio/itens";

/** GET — CARDAPIO_ITEM_VISUALIZAR_PROPRIOS. Ativos e inativos, na ordem do feed. */
export async function listarItens(): Promise<ItemCardapio[]> {
  const { data } = await api.get<ItemCardapio[]>(ITEM_API);
  return data;
}

/** GET /item/{id} — CARDAPIO_ITEM_VISUALIZAR_PROPRIOS. */
export async function buscarItem(id: string): Promise<ItemCardapio> {
  const { data } = await api.get<ItemCardapio>(`${ITEM_API}/item/${id}`);
  return data;
}

/** POST /item — CARDAPIO_ITEM_CRIAR. Com vídeo, nasce PROCESSANDO (HLS em segundo plano). */
export async function criarItem(payload: ItemCardapioPayload): Promise<ItemCardapio> {
  const { data } = await api.post<ItemCardapio>(`${ITEM_API}/item`, payload);
  return data;
}

/** PUT /item/{id} — CARDAPIO_ITEM_ATUALIZAR. Trocar o vídeo reinicia a transcodificação. */
export async function atualizarItem(id: string, payload: ItemCardapioPayload): Promise<ItemCardapio> {
  const { data } = await api.put<ItemCardapio>(`${ITEM_API}/item/${id}`, payload);
  return data;
}

/** DELETE /item/{id} — CARDAPIO_ITEM_APAGAR. */
export async function excluirItem(id: string): Promise<void> {
  await api.delete(`${ITEM_API}/item/${id}`);
}
