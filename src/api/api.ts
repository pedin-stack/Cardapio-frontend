/**
 * @description Instância única do axios. Toda chamada HTTP passa por aqui (blueprint regra 7).
 */
import axios from "axios";

import { limparMarcadorSessao, temMarcadorSessao } from "@/auth/sessionCookies";
import { obterDispositivoId } from "@/utils/dispositivo";

// Mesma origem: /api/* é repassado à API pelo src/middleware.ts (o cookie de sessão fica neste domínio).
export const api = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.headers["X-Device-ID"] = obterDispositivoId();
  }
  return config;
});

/** Há mensagem de negócio no corpo? */
function temMensagem(data: unknown): boolean {
  return typeof data === "object" && data !== null && typeof (data as { message?: unknown }).message === "string";
}

// 401 com corpo VAZIO = sessão expirada/inválida → limpa o marcador e vai ao login.
// 401 com mensagem (credencial errada) e 403 (sem permissão) nunca deslogam.
api.interceptors.response.use(undefined, (error) => {
  if (
    typeof window !== "undefined" &&
    error?.response?.status === 401 &&
    !temMensagem(error.response.data) &&
    temMarcadorSessao() &&
    !window.location.pathname.startsWith("/login")
  ) {
    limparMarcadorSessao();
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
  return Promise.reject(error);
});
