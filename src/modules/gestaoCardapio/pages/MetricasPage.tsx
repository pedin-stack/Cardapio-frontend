/**
 * @description Métricas do restaurante: tempo gasto em cada item, mais curtidos ("pedidos"), quase pedidos
 * (curtiu e desfez) e os dias/horários com mais curtidas. Um único filtro no topo vale para a tela toda:
 * o período recorta tudo; o item destaca o prato nos rankings e recorta o mapa de horários.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDownIcon, CheckIcon, ClockIcon, EyeIcon, HeartBreakIcon, HeartIcon } from "@phosphor-icons/react";

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
        <SeletorItem itens={itens} valor={itemId} onChange={setItemId} />
      </div>

      {loading ? (
        <LoadingState rotulo="Calculando métricas…" />
      ) : erro || !metricas ? (
        <ErrorState mensagem={erro ?? "Não foi possível carregar as métricas."} onRetry={() => refetch()} />
      ) : (
        <div className={`grid gap-4 transition-opacity duration-300 lg:grid-cols-2 ${atualizando ? "opacity-60" : "opacity-100"}`}>
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
            <Tile indice={0} icone={<HeartIcon weight="fill" aria-hidden />} rotulo="Curtidas (pedidos)" valor={formatarContagem(metricas.resumo.curtidas)} />
            <Tile indice={1} icone={<HeartBreakIcon weight="fill" aria-hidden />} rotulo="Quase pedidos" valor={formatarContagem(metricas.resumo.quasePedidos)} />
            <Tile indice={2} icone={<EyeIcon weight="fill" aria-hidden />} rotulo="Visualizações" valor={formatarContagem(metricas.resumo.visualizacoes)} />
            <Tile indice={3} icone={<ClockIcon weight="fill" aria-hidden />} rotulo="Tempo de tela" valor={formatarDuracao(metricas.resumo.tempoTotalMs)} />
          </div>

          <Cartao indice={4} largo titulo="Dias e horários mais pedidos" subtitulo={itemId ? "Curtidas do item selecionado" : "Curtidas de todos os itens"}>
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

          <Cartao indice={7} largo titulo="Tempo de atenção por item" subtitulo="Tempo médio com o prato na tela, por visualização">
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

/** Lista própria em vez de `<select>`: o popup nativo ignora o tema escuro e abre branco no Windows. */
function SeletorItem({ itens, valor, onChange }: { itens: { id: string; nome: string }[]; valor: string | null; onChange: (id: string | null) => void }) {
  const id = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const opcoes: { id: string | null; nome: string }[] = [{ id: null, nome: "Todos os itens" }, ...itens];
  const selecionado = Math.max(0, opcoes.findIndex((opcao) => opcao.id === valor));

  useEffect(() => {
    if (aberto) listaRef.current?.focus();
  }, [aberto]);
  useEffect(() => {
    if (aberto) document.getElementById(`${id}-${ativo}`)?.scrollIntoView({ block: "nearest" });
  }, [aberto, ativo, id]);

  const abrir = () => {
    setAtivo(selecionado);
    setAberto(true);
  };
  const fechar = () => {
    setAberto(false);
    botaoRef.current?.focus();
  };
  const escolher = (indice: number) => {
    onChange(opcoes[indice].id);
    fechar();
  };

  const teclar = (evento: KeyboardEvent<HTMLUListElement>) => {
    const ultimo = opcoes.length - 1;
    const destino: Record<string, number> = { ArrowDown: Math.min(ativo + 1, ultimo), ArrowUp: Math.max(ativo - 1, 0), Home: 0, End: ultimo };
    if (evento.key in destino) setAtivo(destino[evento.key]);
    else if (evento.key === "Enter" || evento.key === " ") escolher(ativo);
    else if (evento.key === "Escape") fechar();
    else return;
    evento.preventDefault();
  };

  return (
    // Fecha ao sair com Tab ou clicar fora (o foco vai para fora do contêiner).
    <div className="relative sm:w-64" onBlur={(evento) => !evento.currentTarget.contains(evento.relatedTarget) && setAberto(false)}>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={(evento) => {
          if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
          evento.preventDefault();
          abrir();
        }}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-label={`Item analisado: ${opcoes[selecionado].nome}`}
        className="flex w-full items-center justify-between gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm ring-1 ring-white/10 transition outline-none hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-(--destaque)/70"
      >
        <span className="truncate">{opcoes[selecionado].nome}</span>
        <CaretDownIcon aria-hidden className={`shrink-0 text-(--texto-suave) transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.ul
            ref={listaRef}
            id={`${id}-lista`}
            role="listbox"
            tabIndex={-1}
            aria-label="Item analisado"
            aria-activedescendant={`${id}-${ativo}`}
            onKeyDown={teclar}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="vidro absolute inset-x-0 z-20 mt-2 max-h-80 origin-top overflow-y-auto rounded-2xl p-1.5 shadow-2xl shadow-black/50 outline-none"
          >
            {opcoes.map((opcao, indice) => (
              <li
                key={opcao.id ?? "todos"}
                id={`${id}-${indice}`}
                role="option"
                aria-selected={indice === selecionado}
                onClick={() => escolher(indice)}
                onMouseMove={() => setAtivo(indice)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${indice === ativo ? "bg-white/[0.08]" : ""} ${indice === selecionado ? "text-(--destaque)" : indice === ativo ? "text-(--texto)" : "text-(--texto-suave)"}`}
              >
                <span className="truncate">{opcao.nome}</span>
                {indice === selecionado && <CheckIcon weight="bold" aria-hidden className="shrink-0" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
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

/** `largo`: ocupa as duas colunas no notebook/PC. */
function Cartao({ indice, largo, titulo, subtitulo, children }: { indice: number; largo?: boolean; titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <motion.section
      custom={indice}
      variants={surgir}
      initial="oculto"
      animate="visivel"
      className={`rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/8 ${largo ? "lg:col-span-2" : ""}`}
    >
      <h2 className="font-display text-base font-semibold">{titulo}</h2>
      <p className="mb-4 text-xs text-(--texto-fraco)">{subtitulo}</p>
      {children}
    </motion.section>
  );
}
