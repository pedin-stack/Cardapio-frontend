/**
 * @description Espelha as rotas do gestor em `RestauranteController` (/api/v1/core/restaurantes/meu-restaurante).
 */
import { api } from "@/api/api";

import type { MeuRestaurante } from "../types/gestaoCardapio";

const MEU_RESTAURANTE_API = "/api/v1/core/restaurantes/meu-restaurante";

/** GET — CORE_RESTAURANTE_ATUALIZAR_PROPRIO. O restaurante vem da sessão. */
export async function buscarMeuRestaurante(): Promise<MeuRestaurante> {
  const { data } = await api.get<MeuRestaurante>(MEU_RESTAURANTE_API);
  return data;
}

/** PUT /cor-destaque — CORE_RESTAURANTE_ATUALIZAR_PROPRIO. `null` volta à cor padrão. */
export async function atualizarCorDestaque(corDestaque: string | null): Promise<MeuRestaurante> {
  const { data } = await api.put<MeuRestaurante>(`${MEU_RESTAURANTE_API}/cor-destaque`, { corDestaque });
  return data;
}
