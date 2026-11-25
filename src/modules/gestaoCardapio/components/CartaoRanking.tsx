/**
 * @description Um ranking de itens (curtidos, quase pedidos ou tempo), com categoria, ordem e paginação próprias.
 */
import { useState } from "react";

import { BarrasRanking } from "@/components/graficos/BarrasRanking";
import { Paginacao } from "@/components/Paginacao";
import { ErrorState } from "@/components/UIStates";

import { CartaoMetrica } from "./CartaoMetrica";
import { Seletor, type Opcao } from "./Seletor";
import { useRankingMetrica } from "../hooks/useMetricas";
import type { OrdemRanking, TipoRanking } from "../types/gestaoCardapio";
import { formatarContagem, formatarDuracao } from "../utils/formatarDuracao";

const ORDENS: Opcao<OrdemRanking>[] = [
  { id: "MAIOR", nome: "Mais → menos" },
  { id: "MENOR", nome: "Menos → mais" },
  { id: "NOME", nome: "A → Z" },
];

type CartaoRankingProps = {
  indice: number;
  largo?: boolean;
  tipo: TipoRanking;
  titulo: string;
  subtitulo: string;
  cor: string;
  vazio: string;
  dias: number;
  categorias: Opcao<string | null>[];
  destaqueId: string | null;
};

export function CartaoRanking({ indice, largo, tipo, titulo, subtitulo, cor, vazio, dias, categorias, destaqueId }: CartaoRankingProps) {
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<OrdemRanking>("MAIOR");
  const [page, setPage] = useState(0);
  // Outro período: volta à primeira página (as seguintes podem nem existir mais).
  const [diasAnteriores, setDiasAnteriores] = useState(dias);
  if (dias !== diasAnteriores) {
    setDiasAnteriores(dias);
    setPage(0);
  }
  const { linhas, totalPages, loading, atualizando, erro, refetch } = useRankingMetrica({ tipo, dias, categoriaId, ordem, page });

  return (
    <CartaoMetrica indice={indice} largo={largo} titulo={titulo} subtitulo={subtitulo}>
      <div className="mb-4 flex gap-2">
        <Seletor
          rotulo={`Categoria de ${titulo.toLowerCase()}`}
          opcoes={categorias}
          valor={categoriaId}
          onChange={(id) => {
            setCategoriaId(id);
            setPage(0);
          }}
          className="min-w-0 flex-1 sm:max-w-64"
        />
        <Seletor
          rotulo={`Ordem de ${titulo.toLowerCase()}`}
          opcoes={ORDENS}
          valor={ordem}
          onChange={(nova) => {
            setOrdem(nova);
            setPage(0);
          }}
          className="w-40 shrink-0"
        />
      </div>
      {loading ? (
        <p className="py-6 text-center text-sm text-(--texto-fraco)">Carregando…</p>
      ) : erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : (
        <div className={`transition-opacity duration-300 ${atualizando ? "opacity-60" : "opacity-100"}`}>
          <BarrasRanking
            cor={cor}
            destaqueId={destaqueId}
            vazio={vazio}
            linhas={linhas.map((linha) => ({
              id: linha.itemId,
              rotulo: linha.nome,
              valor: linha.valor,
              ...(tipo === "TEMPO"
                ? {
                    valorFormatado: formatarDuracao(linha.valor),
                    detalhe: `${formatarContagem(linha.visualizacoes ?? 0)} visualizações · ${formatarDuracao(linha.tempoTotalMs ?? 0)} no total`,
                  }
                : { valorFormatado: formatarContagem(linha.valor) }),
            }))}
          />
        </div>
      )}
      <Paginacao page={page} totalPages={totalPages} onChange={setPage} className="mt-4" />
    </CartaoMetrica>
  );
}
