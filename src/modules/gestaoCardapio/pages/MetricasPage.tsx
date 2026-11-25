/**
 * @description Métricas do restaurante: tempo gasto em cada item, mais curtidos ("pedidos"), quase pedidos
 * (curtiu e desfez) e os dias/horários com mais curtidas. O filtro do topo vale para a tela toda: o período recorta
 * tudo; o item destaca o prato nos rankings e recorta o mapa de horários. Cada ranking tem a própria categoria,
 * ordem e paginação (10 por página). "Comparar períodos" põe o resumo de dois períodos lado a lado (dia, semana, mês,
 * trimestre, semestre, ano ou intervalo livre), independente do filtro do topo.
 */
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ClockIcon, EyeIcon, HeartBreakIcon, HeartIcon } from "@phosphor-icons/react";

import { MapaCalorHorarios } from "@/components/graficos/MapaCalorHorarios";
import { PainelShell } from "@/components/PainelShell";
import { ErrorState, LoadingState } from "@/components/UIStates";

import { CartaoMetrica, surgirMetrica } from "../components/CartaoMetrica";
import { CartaoRanking } from "../components/CartaoRanking";
import { ComparacaoPeriodos } from "../components/ComparacaoPeriodos";
import { Seletor, type Opcao } from "../components/Seletor";
import { useCategorias } from "../hooks/useCategorias";
import { useItensCardapio } from "../hooks/useItensCardapio";
import { useMetricas } from "../hooks/useMetricas";
import { ABAS_GESTAO } from "../navegacao";
import { formatarContagem, formatarDuracao } from "../utils/formatarDuracao";
import { ultimosDias } from "../utils/periodos";

const PERIODOS = [
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

export default function MetricasPage() {
  const [dias, setDias] = useState(30);
  const [itemId, setItemId] = useState<string | null>(null);
  const { itens } = useItensCardapio();
  const { categorias } = useCategorias();
  const { metricas, loading, atualizando, erro, refetch } = useMetricas(ultimosDias(dias), itemId);
  const opcoesCategoria: Opcao<string | null>[] = [{ id: null, nome: "Todas as categorias" }, ...categorias];
  const ranking = { dias, categorias: opcoesCategoria, destaqueId: itemId };

  return (
    <PainelShell titulo="Métricas" abas={ABAS_GESTAO}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-full bg-(--superficie) p-1 ring-1 ring-(--borda)" role="group" aria-label="Período">
          {PERIODOS.map((periodo) => (
            <button
              key={periodo.dias}
              type="button"
              onClick={() => setDias(periodo.dias)}
              aria-pressed={dias === periodo.dias}
              className={`relative flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${dias === periodo.dias ? "text-(--texto)" : "text-(--texto-suave)"}`}
            >
              {dias === periodo.dias && (
                <motion.span layoutId="periodo-ativo" className="absolute inset-0 rounded-full bg-(--bg-elevado) ring-1 ring-(--borda-forte)" />
              )}
              <span className="relative">{periodo.rotulo}</span>
            </button>
          ))}
        </div>
        <Seletor rotulo="Item analisado" opcoes={[{ id: null, nome: "Todos os itens" }, ...itens]} valor={itemId} onChange={setItemId} />
      </div>

      {loading ? (
        <LoadingState rotulo="Calculando métricas…" />
      ) : erro || !metricas ? (
        <ErrorState mensagem={erro ?? "Não foi possível carregar as métricas."} onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 lg:col-span-2 lg:grid-cols-4 ${atualizando ? "opacity-60" : "opacity-100"}`}>
            <Tile indice={0} icone={<HeartIcon weight="fill" aria-hidden />} rotulo="Curtidas (pedidos)" valor={formatarContagem(metricas.resumo.curtidas)} />
            <Tile indice={1} icone={<HeartBreakIcon weight="fill" aria-hidden />} rotulo="Quase pedidos" valor={formatarContagem(metricas.resumo.quasePedidos)} />
            <Tile indice={2} icone={<EyeIcon weight="fill" aria-hidden />} rotulo="Visualizações" valor={formatarContagem(metricas.resumo.visualizacoes)} />
            <Tile indice={3} icone={<ClockIcon weight="fill" aria-hidden />} rotulo="Tempo de tela" valor={formatarDuracao(metricas.resumo.tempoTotalMs)} />
          </div>

          <ComparacaoPeriodos indice={4} />

          <CartaoMetrica indice={5} largo titulo="Dias e horários mais pedidos" subtitulo={itemId ? "Curtidas do item selecionado" : "Curtidas de todos os itens"}>
            <div className={`transition-opacity duration-300 ${atualizando ? "opacity-60" : "opacity-100"}`}>
              <MapaCalorHorarios dados={metricas.curtidasPorHorario} />
            </div>
          </CartaoMetrica>

          <CartaoRanking
            {...ranking}
            indice={6}
            tipo="CURTIDOS"
            titulo="Mais curtidos"
            subtitulo="Curtidas que ficaram na aba Curtidos"
            cor="var(--destaque)"
            vazio="Nenhuma curtida no período."
          />
          <CartaoRanking
            {...ranking}
            indice={7}
            tipo="QUASE_PEDIDOS"
            titulo="Quase pedidos"
            subtitulo="Curtidos e depois removidos — bons candidatos a ajuste de preço ou foto"
            cor="var(--principal)"
            vazio="Ninguém desistiu de um prato no período."
          />
          <CartaoRanking
            {...ranking}
            indice={8}
            largo
            tipo="TEMPO"
            titulo="Tempo de atenção por item"
            subtitulo="Tempo médio com o prato na tela, por visualização"
            cor="var(--destaque)"
            vazio="Nenhum item nesta categoria."
          />
        </div>
      )}
    </PainelShell>
  );
}

function Tile({ indice, icone, rotulo, valor }: { indice: number; icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <motion.div
      custom={indice}
      variants={surgirMetrica}
      initial="oculto"
      animate="visivel"
      className="flex flex-col gap-2 rounded-3xl bg-(--bg-elevado) p-4 ring-1 ring-(--borda)"
    >
      <span className="text-lg text-(--principal-forte)">{icone}</span>
      <span className="text-xs text-(--texto-suave)">{rotulo}</span>
      <span className="text-2xl font-semibold tracking-tight">{valor}</span>
    </motion.div>
  );
}
