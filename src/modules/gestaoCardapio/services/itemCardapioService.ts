/**
 * @description Espelha `ItemCardapioController` (/api/v1/cardapio/itens) e as rotas do gestor no `ComentarioController`.
 */
import { api } from "@/api/api";
import type { Pagina } from "@/types/api";

import type { ComentarioItem, ItemCardapio, ItemCardapioPayload } from "../types/gestaoCardapio";

const ITEM_API = "/api/v1/cardapio/itens";

/** GET — CARDAPIO_ITEM_VISUALIZAR_PROPRIOS. Ativos e inativos, na ordem do feed. */
export async function listarItens(): Promise<ItemCardapio[]> {
  const { data } = await api.get<ItemCardapio[]>(ITEM_API);
  return data;
}

/** GET /pagina?categoriaIds=a,b&page&size — CARDAPIO_ITEM_VISUALIZAR_PROPRIOS. Sem categorias = todos. */
export async function listarItensPagina(params: { categoriaIds: string[]; page: number; size: number }): Promise<Pagina<ItemCardapio>> {
  const { data } = await api.get<Pagina<ItemCardapio>>(`${ITEM_API}/pagina`, {
    // Separado por vírgula: o axios mandaria `categoriaIds[]=`, que o Spring não lê.
    params: { categoriaIds: params.categoriaIds.join(",") || undefined, page: params.page, size: params.size },
  });
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
/** GET /item/{id}/comentarios?page&size — CARDAPIO_ITEM_VISUALIZAR_PROPRIOS. Os mais novos primeiro. */
export async function listarComentariosItem(itemId: string, page: number): Promise<Pagina<ComentarioItem>> {
  const { data } = await api.get<Pagina<ComentarioItem>>(`${ITEM_API}/item/${itemId}/comentarios`, { params: { page, size: 10 } });
  return data;
}

/** DELETE /api/v1/cardapio/comentarios/comentario/{id} — CARDAPIO_ITEM_ATUALIZAR (moderação). */
export async function excluirComentario(id: string): Promise<void> {
  await api.delete(`/api/v1/cardapio/comentarios/comentario/${id}`);
}

export async function excluirItem(id: string): Promise<void> {
  await api.delete(`${ITEM_API}/item/${id}`);
}
