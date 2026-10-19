/**
 * @description Espelha `CardapioPublicoController`, `CurtidaController`, `VisualizacaoController`, `ClienteController`,
 * `AvaliacaoController` e as rotas públicas do `ComentarioController`. O dispositivo vai no header `X-Device-ID`,
 * injetado pelo interceptor da instância `api`; o cliente identificado, em `X-Cliente-Token`.
 */
import { api } from "@/api/api";
import type { Pagina } from "@/types/api";

import type { CardapioPublico, ClienteSessao, Comentario, IdentificacaoCliente, VisualizacaoItem } from "../types/cardapioPublico";

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

const comToken = (token: string) => ({ headers: { "X-Cliente-Token": token } });

/** POST .../clientes/cliente — público. 422 = dado inválido (ex.: CPF). */
export async function identificarCliente(slug: string, dados: IdentificacaoCliente): Promise<ClienteSessao> {
  const { data } = await api.post<ClienteSessao>(`${restauranteApi(slug)}/clientes/cliente`, dados);
  return data;
}

/** PUT .../itens/item/{itemId}/avaliacao — cliente identificado (401 sem token válido). */
export async function avaliarItem(slug: string, itemId: string, estrelas: number, token: string): Promise<void> {
  await api.put(`${restauranteApi(slug)}/itens/item/${itemId}/avaliacao`, { estrelas }, comToken(token));
}

/** GET .../itens/item/{itemId}/comentarios — público, os mais novos primeiro. */
export async function listarComentarios(slug: string, itemId: string, page: number): Promise<Pagina<Comentario>> {
  const { data } = await api.get<Pagina<Comentario>>(`${restauranteApi(slug)}/itens/item/${itemId}/comentarios`, {
    params: { page, size: 10 },
  });
  return data;
}

/** POST .../itens/item/{itemId}/comentarios/comentario — cliente identificado (401 sem token válido). */
export async function comentarItem(slug: string, itemId: string, texto: string, token: string): Promise<Comentario> {
  const { data } = await api.post<Comentario>(`${restauranteApi(slug)}/itens/item/${itemId}/comentarios/comentario`, { texto }, comToken(token));
  return data;
}
