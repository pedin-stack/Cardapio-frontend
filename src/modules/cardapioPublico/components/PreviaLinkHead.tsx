/**
 * @description Tags Open Graph da prévia do link do restaurante.
 */
import Head from "next/head";

import type { Previa } from "../services/previaService";

export function PreviaLinkHead({ previa }: { previa: Previa }) {
  return (
    <Head>
      <title>{`${previa.nome} · Cardápio`}</title>
      <meta property="og:type" content="website" />
      <meta property="og:title" content={previa.nome} />
      {previa.descricao && <meta property="og:description" content={previa.descricao} />}
      {previa.imagem && <meta property="og:image" content={previa.imagem} />}
    </Head>
  );
}
