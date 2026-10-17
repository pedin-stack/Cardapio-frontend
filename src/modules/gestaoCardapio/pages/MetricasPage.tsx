/**
 * @description Métricas do restaurante: tempo gasto em cada item, mais curtidos ("pedidos"), quase pedidos
 * (curtiu e desfez) e os dias/horários com mais curtidas. Um único filtro no topo vale para a tela toda:
 * o período recorta tudo; o item destaca o prato nos rankings e recorta o mapa de horários.
 */
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ClockIcon, EyeIcon, HeartBreakIcon, HeartIcon } from "@phosphor-icons/react";

import { PainelShell } from "@/components/PainelShell";
import { ErrorState, LoadingState } from "@/components/UIStates";

import { BarrasRanking } from "../components/BarrasRanking";
import { MapaCalorHorarios } from "../components/MapaCalorHorarios";
import { useItensCardapio } from "../hooks/useItensCardapio";
import { useMetricas } from "../hooks/useMetricas";
import { ABAS_GESTAO } from "../navegacao";
import { formatarContagem, formatarDuracao } from "../utils/formatarDuracao";

const PERIODOS = [
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

const surgir = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } }),
};

export default function MetricasPage() {
  const [dias, setDias] = useState(30);
  const [itemId, setItemId] = useState<string | null>(null);
  const { itens } = useItensCardapio();
  const { metricas, loading, atualizando, erro, refetch } = useMetricas(dias, itemId);

  return (
    <PainelShell titulo="Métricas" abas={ABAS_GESTAO}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/8" role="group" aria-label="Período">
          {PERIODOS.map((periodo) => (
            <button
              key={periodo.dias}
              type="button"
              onClick={() => setDias(periodo.dias)}
              aria-pressed={dias === periodo.dias}
              className={`relative flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${dias === periodo.dias ? "text-white" : "text-(--texto-suave)"}`}
            >
              {dias === periodo.dias && (
                <motion.span layoutId="periodo-ativo" className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15" />
              )}
              <span className="relative">{periodo.rotulo}</span>
            </button>
          ))}
        </div>
        <select
          value={itemId ?? ""}
          onChange={(evento) => setItemId(evento.target.value || null)}
          aria-label="Item analisado"
          className="rounded-full bg-white/[0.06] px-4 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-(--destaque)/70"
        >
          <option value="">Todos os itens</option>
          {itens.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState rotulo="Calculando métricas…" />
      ) : erro || !metricas ? (
        <ErrorState mensagem={erro ?? "Não foi possível carregar as métricas."} onRetry={() => refetch()} />
      ) : (
        <div className={`flex flex-col gap-4 transition-opacity duration-300 ${atualizando ? "opacity-60" : "opacity-100"}`}>
          <div className="grid grid-cols-2 gap-3">
            <Tile indice={0} icone={<HeartIcon weight="fill" aria-hidden />} rotulo="Curtidas (pedidos)" valor={formatarContagem(metricas.resumo.curtidas)} />
            <Tile indice={1} icone={<HeartBreakIcon weight="fill" aria-hidden />} rotulo="Quase pedidos" valor={formatarContagem(metricas.resumo.quasePedidos)} />
            <Tile indice={2} icone={<EyeIcon weight="fill" aria-hidden />} rotulo="Visualizações" valor={formatarContagem(metricas.resumo.visualizacoes)} />
            <Tile indice={3} icone={<ClockIcon weight="fill" aria-hidden />} rotulo="Tempo de tela" valor={formatarDuracao(metricas.resumo.tempoTotalMs)} />
          </div>

          <Cartao indice={4} titulo="Dias e horários mais pedidos" subtitulo={itemId ? "Curtidas do item selecionado" : "Curtidas de todos os itens"}>
            <MapaCalorHorarios dados={metricas.curtidasPorHorario} />
          </Cartao>

          <Cartao indice={5} titulo="Mais curtidos" subtitulo="Curtidas que ficaram na aba Curtidos">
            <BarrasRanking
              cor="var(--destaque)"
              destaqueId={itemId}
              vazio="Nenhuma curtida no período."
              linhas={metricas.maisCurtidos.map((m) => ({ id: m.itemId, rotulo: m.nome, valor: m.total, valorFormatado: formatarContagem(m.total) }))}
            />
          </Cartao>

          <Cartao indice={6} titulo="Quase pedidos" subtitulo="Curtidos e depois removidos — bons candidatos a ajuste de preço ou foto">
            <BarrasRanking
              cor="var(--destaque-2)"
              destaqueId={itemId}
              vazio="Ninguém desistiu de um prato no período."
              linhas={metricas.quasePedidos.map((m) => ({ id: m.itemId, rotulo: m.nome, valor: m.total, valorFormatado: formatarContagem(m.total) }))}
            />
          </Cartao>

          <Cartao indice={7} titulo="Tempo de atenção por item" subtitulo="Tempo médio com o prato na tela, por visualização">
            <BarrasRanking
              cor="var(--destaque)"
              destaqueId={itemId}
              vazio="Sem visualizações no período."
              linhas={[...metricas.tempoPorItem]
                .sort((a, b) => b.tempoMedioMs - a.tempoMedioMs)
                .map((t) => ({
                  id: t.itemId,
                  rotulo: t.nome,
                  valor: t.tempoMedioMs,
                  valorFormatado: formatarDuracao(t.tempoMedioMs),
                  detalhe: `${formatarContagem(t.visualizacoes)} visualizações · ${formatarDuracao(t.tempoTotalMs)} no total`,
                }))}
            />
          </Cartao>
        </div>
      )}
    </PainelShell>
  );
}

function Tile({ indice, icone, rotulo, valor }: { indice: number; icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <motion.div
      custom={indice}
      variants={surgir}
      initial="oculto"
      animate="visivel"
      className="flex flex-col gap-2 rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/8"
    >
      <span className="text-lg text-(--destaque)">{icone}</span>
      <span className="text-xs text-(--texto-suave)">{rotulo}</span>
      <span className="text-2xl font-semibold tracking-tight">{valor}</span>
    </motion.div>
  );
}

function Cartao({ indice, titulo, subtitulo, children }: { indice: number; titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <motion.section custom={indice} variants={surgir} initial="oculto" animate="visivel" className="rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/8">
      <h2 className="font-display text-base font-semibold">{titulo}</h2>
      <p className="mb-4 text-xs text-(--texto-fraco)">{subtitulo}</p>
      {children}
    </motion.section>
  );
}
