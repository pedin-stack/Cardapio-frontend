/**
 * @description Espelha `AutenticacaoController` e `UsuarioController` do backend.
 */
import { api } from "@/api/api";

import type { LoginPayload, UsuarioSessao } from "../types/sessao";

const SESSAO_API = "/api/v1/autenticacao/sessoes/sessao";
const USUARIOS_API = "/api/v1/core/usuarios";

/**
 * POST /api/v1/autenticacao/sessoes/sessao — público. Grava o JWT em cookie HttpOnly.
 * 401: credenciais inválidas; 403: usuário ou restaurante desativado.
 */
export async function criarSessao(payload: LoginPayload): Promise<UsuarioSessao> {
  const { data } = await api.post<UsuarioSessao>(SESSAO_API, payload);
  return data;
}

/** DELETE /api/v1/autenticacao/sessoes/sessao — público. Expira o cookie HttpOnly. */
export async function excluirSessao(): Promise<void> {
  await api.delete(SESSAO_API);
}

/** GET /api/v1/core/usuarios/usuario/meus-dados — autenticado. */
export async function buscarMeusDados(): Promise<UsuarioSessao> {
  const { data } = await api.get<UsuarioSessao>(`${USUARIOS_API}/usuario/meus-dados`);
  return data;
}
