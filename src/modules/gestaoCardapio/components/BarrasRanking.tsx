/**
 * @description Ranking em barras horizontais (série única: uma cor só, sem legenda — o título nomeia).
 * Barra ≤ 20 px, ponta arredondada só no fim, valor ao lado da ponta em tinta de texto. O item filtrado
 * fica em destaque e os demais esmaecem (ênfase em vez de mais cores).
 */
import { motion } from "framer-motion";

export type LinhaRanking = {
  id: string;
  rotulo: string;
  valor: number;
  valorFormatado: string;
  detalhe?: string;
};

type BarrasRankingProps = {
  linhas: LinhaRanking[];
  /** Cor da marca (token CSS), nunca usada no texto. */
  cor: string;
  destaqueId?: string | null;
  vazio: string;
};

export function BarrasRanking({ linhas, cor, destaqueId, vazio }: BarrasRankingProps) {
  const maximo = Math.max(...linhas.map((linha) => linha.valor), 0);
  // Linhas zeradas ainda aparecem: em "menos → mais", os itens que ninguém viu são a resposta.
  if (linhas.length === 0) {
    return <p className="py-6 text-center text-sm text-(--texto-fraco)">{vazio}</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {linhas.map((linha, i) => {
        const esmaecido = Boolean(destaqueId) && linha.id !== destaqueId;
        const largura = linha.valor > 0 ? `${Math.max((linha.valor / maximo) * 100, 2)}%` : "0%";
        return (
          <li
            key={linha.id}
            title={linha.detalhe ? `${linha.rotulo}: ${linha.detalhe}` : undefined}
            className={`group transition-opacity duration-300 ${esmaecido ? "opacity-35" : "opacity-100"}`}
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-(--texto)">{linha.rotulo}</span>
              <span className="shrink-0 font-medium text-(--texto-suave) tabular-nums">{linha.valorFormatado}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-r bg-white/[0.05]">
              <motion.div
                className="h-full rounded-r-[4px] transition-[filter] group-hover:brightness-125"
                style={{ background: cor }}
                initial={{ width: 0 }}
                animate={{ width: largura }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {linha.detalhe && <p className="mt-1 text-xs text-(--texto-fraco)">{linha.detalhe}</p>}
          </li>
        );
      })}
    </ol>
  );
}
