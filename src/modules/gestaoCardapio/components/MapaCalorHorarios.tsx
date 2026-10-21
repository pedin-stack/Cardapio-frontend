/**
 * @description Mapa de calor dia da semana × hora das curtidas ("pedidos").
 * Escala sequencial de UM tom (turquesa), do claro ao mais escuro, com legenda de escala; células separadas
 * por 2 px de fundo. Passar o mouse, focar ou tocar numa célula mostra o valor na linha de leitura abaixo
 * (o valor nunca depende só da cor), e há uma visão em tabela dos horários de pico.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import type { Metricas } from "../types/gestaoCardapio";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HORAS = Array.from({ length: 24 }, (_, h) => h);
/** 5 degraus de intensidade (turquesa misturado ao fundo claro até o turquesa forte); 0 = sem curtidas. */
const DEGRAUS = [
  "color-mix(in oklab, var(--principal) 20%, var(--bg))",
  "color-mix(in oklab, var(--principal) 45%, var(--bg))",
  "color-mix(in oklab, var(--principal) 72%, var(--bg))",
  "var(--principal)",
  "var(--principal-forte)",
];

type Celula = { dia: number; hora: number; total: number };

function corDaCelula(total: number, maximo: number): string {
  if (total === 0 || maximo === 0) return "var(--superficie-forte)";
  return DEGRAUS[Math.min(DEGRAUS.length - 1, Math.floor((total / maximo) * DEGRAUS.length - 1e-9))];
}

const descrever = (c: Celula) => `${DIAS[c.dia - 1]}, ${c.hora}h: ${c.total} ${c.total === 1 ? "curtida" : "curtidas"}`;

export function MapaCalorHorarios({ dados }: { dados: Metricas["curtidasPorHorario"] }) {
  const [focada, setFocada] = useState<Celula | null>(null);
  const [tabela, setTabela] = useState(false);

  const { grade, maximo, pico, ordenadas } = useMemo(() => {
    const porChave = new Map(dados.map((d) => [`${d.diaSemana}-${d.hora}`, d.total]));
    const grade = DIAS.map((_, i) => HORAS.map((hora) => ({ dia: i + 1, hora, total: porChave.get(`${i + 1}-${hora}`) ?? 0 })));
    const ordenadas = [...dados].sort((a, b) => b.total - a.total).map((d) => ({ dia: d.diaSemana, hora: d.hora, total: d.total }));
    return { grade, maximo: Math.max(0, ...dados.map((d) => d.total)), pico: ordenadas[0] ?? null, ordenadas };
  }, [dados]);

  if (maximo === 0) {
    return <p className="py-6 text-center text-sm text-(--texto-fraco)">Ainda sem curtidas no período.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {pico && (
        <p className="text-sm text-(--texto-suave)">
          Pico: <strong className="font-semibold text-(--texto)">{DIAS[pico.dia - 1].toLowerCase()} às {pico.hora}h</strong> ({pico.total}{" "}
          {pico.total === 1 ? "curtida" : "curtidas"})
        </p>
      )}

      {tabela ? (
        <table className="w-full text-sm">
          <caption className="sr-only">Horários com mais curtidas</caption>
          <thead>
            <tr className="text-left text-xs text-(--texto-fraco)">
              <th className="py-1 font-medium">Dia</th>
              <th className="py-1 font-medium">Hora</th>
              <th className="py-1 text-right font-medium">Curtidas</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {ordenadas.slice(0, 15).map((c) => (
              <tr key={`${c.dia}-${c.hora}`} className="border-t border-(--borda)">
                <td className="py-1.5">{DIAS[c.dia - 1]}</td>
                <td className="py-1.5">{c.hora}h</td>
                <td className="py-1.5 text-right">{c.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[340px] grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-[2px]" role="grid" aria-label="Curtidas por dia e hora">
            {grade.map((linha, i) => (
              <div key={DIAS[i]} role="row" className="contents">
                <span role="rowheader" className="self-center pr-1 text-[10px] text-(--texto-fraco)">
                  {DIAS_CURTOS[i]}
                </span>
                {linha.map((celula) => (
                  <motion.button
                    key={celula.hora}
                    type="button"
                    role="gridcell"
                    aria-label={descrever(celula)}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i * 24 + celula.hora) * 0.002, duration: 0.3 }}
                    onMouseEnter={() => setFocada(celula)}
                    onFocus={() => setFocada(celula)}
                    onClick={() => setFocada(celula)}
                    className={`aspect-square rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-(--texto) ${
                      focada?.dia === celula.dia && focada.hora === celula.hora ? "ring-1 ring-(--texto)" : ""
                    }`}
                    style={{ background: corDaCelula(celula.total, maximo) }}
                  />
                ))}
              </div>
            ))}
            <span />
            {HORAS.map((hora) => (
              <span key={hora} className="pt-1 text-center text-[9px] text-(--texto-fraco) tabular-nums" aria-hidden>
                {hora % 3 === 0 ? hora : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="min-h-5 text-sm text-(--texto-suave)">
          {tabela ? "" : focada ? descrever(focada) : "Toque numa célula para ver o valor."}
        </p>
        <div className="flex items-center gap-3">
          {!tabela && (
            <div className="flex items-center gap-1 text-[10px] text-(--texto-fraco)" aria-hidden>
              0
              {DEGRAUS.map((d) => (
                <span key={d} className="size-3 rounded-[2px]" style={{ background: d }} />
              ))}
              {maximo}
            </div>
          )}
          <button type="button" onClick={() => setTabela((t) => !t)} className="text-xs font-medium text-(--principal-forte) underline-offset-4 hover:underline">
            {tabela ? "Ver mapa" : "Ver como tabela"}
          </button>
        </div>
      </div>
    </div>
  );
}
