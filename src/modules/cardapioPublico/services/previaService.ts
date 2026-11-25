/**
 * @description Dados da prévia do link, buscados no servidor (getStaticProps): os robôs do WhatsApp e do Instagram
 * não rodam JS, então nome, descrição e logo vão no HTML. Não usa a instância `api`: aqui não há navegador nem
 * middleware, a chamada vai direto à API com o segredo do front.
 */
import type { CardapioPublico } from "../types/cardapioPublico";

export type Previa = { nome: string; descricao: string | null; imagem: string | null };

/** GET /api/v1/cardapio/restaurantes/restaurante/{slug}. `null` = restaurante inexistente ou API fora do ar. */
export async function buscarPrevia(slug: string): Promise<Previa | null> {
  const origem = process.env.API_ORIGEM ?? "http://localhost:8080";
  try {
    const resposta = await fetch(`${origem}/api/v1/cardapio/restaurantes/restaurante/${encodeURIComponent(slug)}`, {
      headers: process.env.API_SEGREDO_FRONT ? { "X-Cardapio-Front": process.env.API_SEGREDO_FRONT } : {},
      signal: AbortSignal.timeout(5000),
    });
    if (!resposta.ok) return null;
    const { restaurante } = (await resposta.json()) as CardapioPublico;
    return { nome: restaurante.nome, descricao: restaurante.descricao ?? null, imagem: restaurante.logoUrl ?? restaurante.capaUrl ?? null };
  } catch {
    // API fora do ar: a página sai sem prévia e tenta de novo logo.
    return null;
  }
}
