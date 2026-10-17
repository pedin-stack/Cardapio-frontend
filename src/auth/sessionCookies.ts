/**
 * @description Marcador de sessão. O JWT vive em cookie HttpOnly emitido pela API; o JS só guarda
 * "há sessão até X" para decidir se vale hidratar (`meus-dados`) e se um 401 significa sessão expirada.
 */
import Cookies from "js-cookie";

export const COOKIE_SESSAO = "cardapio_sessao";

function opcoes(expiraEm?: Date): Cookies.CookieAttributes {
  return {
    path: "/",
    sameSite: "lax",
    // secure em http://localhost faria o navegador descartar o cookie
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    expires: expiraEm,
  };
}

export function gravarMarcadorSessao(expiraEm: string): void {
  Cookies.set(COOKIE_SESSAO, expiraEm, opcoes(new Date(expiraEm)));
}

export function temMarcadorSessao(): boolean {
  return Boolean(Cookies.get(COOKIE_SESSAO));
}

export function limparMarcadorSessao(): void {
  // Remover com o mesmo path; senão o navegador trata como outro cookie.
  Cookies.remove(COOKIE_SESSAO, { path: "/" });
}
