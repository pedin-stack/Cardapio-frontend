/**
 * @description Repassa /api/* para a API (API_ORIGEM) injetando o segredo que prova que a chamada veio do front.
 * A API recusa com 403 qualquer /api/* sem ele (FrontendOrigemFilter) — curl/Postman direto na VPS não passa.
 * Roda no servidor (Vercel): API_ORIGEM e API_SEGREDO_FRONT nunca chegam ao navegador.
 * O cookie de sessão continua no domínio do front, como no rewrite que este middleware substitui.
 */
import { NextResponse, type NextRequest } from "next/server";

export const config = { matcher: "/api/:caminho*" };

const HEADER_SEGREDO = "X-Cardapio-Front";

export function middleware(request: NextRequest) {
  const origem = process.env.API_ORIGEM ?? (process.env.NODE_ENV === "production" ? undefined : "http://localhost:8080");
  if (!origem) {
    return NextResponse.json({ status: 500, message: "API_ORIGEM não configurada." }, { status: 500 });
  }

  const destino = new URL(request.nextUrl.pathname + request.nextUrl.search, origem);
  const headers = new Headers(request.headers);
  // Nunca repassar um segredo vindo do cliente; só o do servidor (vazio no dev, onde o filtro da API fica desligado).
  headers.delete(HEADER_SEGREDO);
  const segredo = process.env.API_SEGREDO_FRONT;
  if (segredo) headers.set(HEADER_SEGREDO, segredo);

  return NextResponse.rewrite(destino, { request: { headers } });
}
