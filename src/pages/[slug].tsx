import type { GetStaticPaths, GetStaticProps } from "next";

import { PreviaLinkHead } from "@/modules/cardapioPublico/components/PreviaLinkHead";
import CardapioPublicoPage from "@/modules/cardapioPublico/pages/CardapioPublicoPage";
import { buscarPrevia, type Previa } from "@/modules/cardapioPublico/services/previaService";

export default function CardapioRestaurante({ previa }: { previa: Previa | null }) {
  return (
    <>
      {previa && <PreviaLinkHead previa={previa} />}
      <CardapioPublicoPage />
    </>
  );
}

// ISR: cada restaurante vira HTML na primeira visita e se refaz em segundo plano. O cardápio em si continua
// vindo do navegador; daqui só sai a prévia.
export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export const getStaticProps: GetStaticProps<{ previa: Previa | null }> = async ({ params }) => {
  const previa = await buscarPrevia(String(params?.slug ?? ""));
  // As URLs das imagens são assinadas por 24 h: refazer de hora em hora mantém a da prévia válida.
  return { props: { previa }, revalidate: previa ? 3600 : 60 };
};
