/**
 * @description "Comparar períodos": o resumo de dois períodos lado a lado (dia, semana, mês, trimestre, semestre,
 * ano ou intervalo livre), independente do filtro do topo.
 */
import { useState } from "react";

import { ErrorState } from "@/components/UIStates";

import { CartaoMetrica } from "./CartaoMetrica";
import { Seletor, type Opcao } from "./Seletor";
import { useMetricas } from "../hooks/useMetricas";
import { formatarContagem, formatarDuracao } from "../utils/formatarDuracao";
import { paraData, periodoAnterior, periodoQueContem, rotuloPeriodo, type Granularidade, type Intervalo } from "../utils/periodos";

type ModoComparacao = Granularidade | "PERSONALIZADO";

const MODOS_COMPARACAO: Opcao<ModoComparacao>[] = [
  { id: "DIA", nome: "Dia" },
  { id: "SEMANA", nome: "Semana" },
  { id: "MES", nome: "Mês" },
  { id: "TRIMESTRE", nome: "Trimestre" },
  { id: "SEMESTRE", nome: "Semestre" },
  { id: "ANO", nome: "Ano" },
  { id: "PERSONALIZADO", nome: "Intervalo livre" },
];

/** O período que contém hoje contra o anterior. */
function atualContraAnterior(granularidade: Granularidade) {
  const a = periodoQueContem(granularidade, new Date());
  return { a, b: periodoAnterior(granularidade, a) };
}

export function ComparacaoPeriodos({ indice }: { indice: number }) {
  const [modo, setModo] = useState<ModoComparacao>("MES");
  const [periodos, setPeriodos] = useState(() => atualContraAnterior("MES"));
  const a = useMetricas(periodos.a);
  const b = useMetricas(periodos.b);
  const erro = a.erro ?? b.erro;

  const trocarModo = (novo: ModoComparacao) => {
    setModo(novo);
    // No intervalo livre, os períodos que estavam na tela viram o ponto de partida.
    if (novo !== "PERSONALIZADO") setPeriodos(atualContraAnterior(novo));
  };

  return (
    <CartaoMetrica indice={indice} largo titulo="Comparar períodos" subtitulo="O restaurante inteiro em dois períodos; a variação é de A em relação a B">
      <div className="mb-4 grid gap-3 sm:grid-cols-[11rem_1fr_1fr] sm:items-start">
        <Seletor rotulo="Comparar por" opcoes={MODOS_COMPARACAO} valor={modo} onChange={trocarModo} className="" />
        <CampoPeriodo letra="A" modo={modo} valor={periodos.a} onChange={(novo) => setPeriodos((atual) => ({ ...atual, a: novo }))} />
        <CampoPeriodo letra="B" modo={modo} valor={periodos.b} onChange={(novo) => setPeriodos((atual) => ({ ...atual, b: novo }))} />
      </div>
      {a.loading || b.loading ? (
        <p className="py-6 text-center text-sm text-(--texto-fraco)">Carregando…</p>
      ) : erro || !a.metricas || !b.metricas ? (
        <ErrorState
          mensagem={erro ?? "Não foi possível carregar as métricas."}
          onRetry={() => {
            a.refetch();
            b.refetch();
          }}
        />
      ) : (
        <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 lg:grid-cols-4 ${a.atualizando || b.atualizando ? "opacity-60" : "opacity-100"}`}>
          <BlocoComparacao rotulo="Curtidas (pedidos)" a={a.metricas.resumo.curtidas} b={b.metricas.resumo.curtidas} formatar={formatarContagem} />
          <BlocoComparacao
            rotulo="Quase pedidos"
            a={a.metricas.resumo.quasePedidos}
            b={b.metricas.resumo.quasePedidos}
            formatar={formatarContagem}
            menosEMelhor
          />
          <BlocoComparacao rotulo="Visualizações" a={a.metricas.resumo.visualizacoes} b={b.metricas.resumo.visualizacoes} formatar={formatarContagem} />
          <BlocoComparacao rotulo="Tempo de tela" a={a.metricas.resumo.tempoTotalMs} b={b.metricas.resumo.tempoTotalMs} formatar={formatarDuracao} />
        </div>
      )}
    </CartaoMetrica>
  );
}

const CLASSE_DATA =
  "min-w-0 flex-1 rounded-full bg-(--bg-elevado) px-3 py-2 text-sm ring-1 ring-(--borda) outline-none focus-visible:ring-2 focus-visible:ring-(--destaque)/70";

type CampoPeriodoProps = { letra: string; modo: ModoComparacao; valor: Intervalo; onChange: (intervalo: Intervalo) => void };

/** Uma data (vale o período da granularidade que a contém) ou, no intervalo livre, início e fim. */
function CampoPeriodo({ letra, modo, valor, onChange }: CampoPeriodoProps) {
  const mudar = (inicio: string, fim: string) => {
    // Campo apagado: mantém o período.
    if (!inicio || !fim) return;
    if (modo !== "PERSONALIZADO") return onChange(periodoQueContem(modo, paraData(inicio)));
    const [de, ate] = [inicio, fim].sort();
    onChange({ inicio: de, fim: ate });
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-(--superficie-forte) text-xs font-semibold" aria-hidden>
          {letra}
        </span>
        {modo === "PERSONALIZADO" ? (
          <>
            <input type="date" value={valor.inicio} onChange={(e) => mudar(e.target.value, valor.fim)} aria-label={`Período ${letra}: início`} className={CLASSE_DATA} />
            <span className="text-xs text-(--texto-fraco)">a</span>
            <input type="date" value={valor.fim} onChange={(e) => mudar(valor.inicio, e.target.value)} aria-label={`Período ${letra}: fim`} className={CLASSE_DATA} />
          </>
        ) : (
          <input type="date" value={valor.inicio} onChange={(e) => mudar(e.target.value, e.target.value)} aria-label={`Período ${letra}`} className={CLASSE_DATA} />
        )}
      </div>
      <p className="mt-1 pl-9 text-xs text-(--texto-suave) first-letter:uppercase">{rotuloPeriodo(modo, valor)}</p>
    </div>
  );
}

type BlocoComparacaoProps = { rotulo: string; a: number; b: number; formatar: (valor: number) => string; menosEMelhor?: boolean };

/** Valor de A, variação sobre B (verde = melhorou) e o valor de B. */
function BlocoComparacao({ rotulo, a, b, formatar, menosEMelhor }: BlocoComparacaoProps) {
  const variacao = b === 0 ? null : (a - b) / b;
  const melhorou = menosEMelhor ? a < b : a > b;
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-(--superficie) p-3 ring-1 ring-(--borda)">
      <span className="text-xs text-(--texto-suave)">{rotulo}</span>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-xl font-semibold tracking-tight">{formatar(a)}</span>
        <span className={`text-xs font-semibold ${a === b ? "text-(--texto-fraco)" : melhorou ? "text-(--sucesso)" : "text-(--perigo)"}`}>
          {variacao === null
            ? a > 0
              ? "novo"
              : "—"
            : variacao.toLocaleString("pt-BR", { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" })}
        </span>
      </div>
      <span className="text-xs text-(--texto-fraco)">B: {formatar(b)}</span>
    </div>
  );
}
