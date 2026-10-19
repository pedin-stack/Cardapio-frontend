/**
 * @description Espelha as rotas do gestor em `RestauranteController` (/api/v1/core/restaurantes/meu-restaurante).
 */
import { api } from "@/api/api";

import type { AparenciaPayload, MeuRestaurante } from "../types/gestaoCardapio";

const MEU_RESTAURANTE_API = "/api/v1/core/restaurantes/meu-restaurante";

/** GET — CORE_RESTAURANTE_ATUALIZAR_PROPRIO. O restaurante vem da sessão. */
export async function buscarMeuRestaurante(): Promise<MeuRestaurante> {
  const { data } = await api.get<MeuRestaurante>(MEU_RESTAURANTE_API);
  return data;
}

/** PUT /aparencia — CORE_RESTAURANTE_ATUALIZAR_PROPRIO. Vídeo novo volta como PROCESSANDO (vira HLS no servidor). */
export async function atualizarAparencia(payload: AparenciaPayload): Promise<MeuRestaurante> {
  const { data } = await api.put<MeuRestaurante>(`${MEU_RESTAURANTE_API}/aparencia`, payload);
  return data;
}
