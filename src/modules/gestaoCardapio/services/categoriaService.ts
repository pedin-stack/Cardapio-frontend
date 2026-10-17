/**
 * @description Espelha `CategoriaController` (/api/v1/cardapio/categorias).
 */
import { api } from "@/api/api";

import type { Categoria, CategoriaPayload } from "../types/gestaoCardapio";

const CATEGORIA_API = "/api/v1/cardapio/categorias";

/** GET — CARDAPIO_CATEGORIA_VISUALIZAR_PROPRIAS. */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>(CATEGORIA_API);
  return data;
}

/** POST /categoria — CARDAPIO_CATEGORIA_CRIAR. 409 se o nome já existir. */
export async function criarCategoria(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.post<Categoria>(`${CATEGORIA_API}/categoria`, payload);
  return data;
}

/** PUT /categoria/{id} — CARDAPIO_CATEGORIA_ATUALIZAR. */
export async function atualizarCategoria(id: string, payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`${CATEGORIA_API}/categoria/${id}`, payload);
  return data;
}

/** DELETE /categoria/{id} — CARDAPIO_CATEGORIA_APAGAR. Os itens só perdem o vínculo. */
export async function excluirCategoria(id: string): Promise<void> {
  await api.delete(`${CATEGORIA_API}/categoria/${id}`);
}
