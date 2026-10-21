import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

import CardapioPublicoPage from "@/modules/cardapioPublico/pages/CardapioPublicoPage";
import type { CardapioPublico } from "@/modules/cardapioPublico/types/cardapioPublico";

/** Prévia do link (WhatsApp, Instagram…): os robôs não rodam JS, então nome, descrição e logo vão no HTML. */
type Previa = { nome: string; descricao: string | null; imagem: string | null };

export default function CardapioRestaurante({ previa }: { previa: Previa | null }) {
  return (
    <>
      {previa && (
        <Head>
          <title>{`${previa.nome} · Cardápio`}</title>
          <meta property="og:type" content="website" />
          <meta property="og:title" content={previa.nome} />
          {previa.descricao && <meta property="og:description" content={previa.descricao} />}
          {previa.imagem && <meta property="og:image" content={previa.imagem} />}
        </Head>
      )}
      <CardapioPublicoPage />
    </>
  );
}

// ISR: cada restaurante vira HTML na primeira visita e se refaz em segundo plano. O cardápio em si continua
// vindo do navegador; daqui só sai a prévia.
export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export const getStaticProps: GetStaticProps<{ previa: Previa | null }> = async ({ params }) => {
  const slug = String(params?.slug ?? "");
  const origem = process.env.API_ORIGEM ?? "http://localhost:8080";
  try {
    const resposta = await fetch(`${origem}/api/v1/cardapio/restaurantes/restaurante/${encodeURIComponent(slug)}`, {
      headers: process.env.API_SEGREDO_FRONT ? { "X-Cardapio-Front": process.env.API_SEGREDO_FRONT } : {},
      signal: AbortSignal.timeout(5000),
    });
    if (!resposta.ok) return { props: { previa: null }, revalidate: 60 };
    const { restaurante } = (await resposta.json()) as CardapioPublico;
    const previa = { nome: restaurante.nome, descricao: restaurante.descricao ?? null, imagem: restaurante.logoUrl ?? restaurante.capaUrl ?? null };
    // As URLs das imagens são assinadas por 24 h: refazer de hora em hora mantém a da prévia válida.
    return { props: { previa }, revalidate: 3600 };
  } catch {
    // API fora do ar: a página sai sem prévia e tenta de novo logo.
    return { props: { previa: null }, revalidate: 60 };
  }
};
