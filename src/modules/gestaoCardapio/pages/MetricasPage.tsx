/**
 * @description Métricas do restaurante: tempo gasto em cada item, mais curtidos ("pedidos"), quase pedidos
 * (curtiu e desfez) e os dias/horários com mais curtidas. O filtro do topo vale para a tela toda: o período recorta
 * tudo; o item destaca o prato nos rankings e recorta o mapa de horários. Cada ranking tem a própria categoria,
 * ordem e paginação (10 por página).
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDownIcon, CheckIcon, ClockIcon, EyeIcon, HeartBreakIcon, HeartIcon } from "@phosphor-icons/react";

import { PainelShell } from "@/components/PainelShell";
import { Paginacao } from "@/components/Paginacao";
import { ErrorState, LoadingState } from "@/components/UIStates";

import { BarrasRanking } from "../components/BarrasRanking";
import { MapaCalorHorarios } from "../components/MapaCalorHorarios";
import { useCategorias } from "../hooks/useCategorias";
import { useItensCardapio } from "../hooks/useItensCardapio";
import { useMetricas, useRankingMetrica } from "../hooks/useMetricas";
import { ABAS_GESTAO } from "../navegacao";
import type { OrdemRanking, TipoRanking } from "../types/gestaoCardapio";
import { formatarContagem, formatarDuracao } from "../utils/formatarDuracao";

const PERIODOS = [
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

const ORDENS: Opcao<OrdemRanking>[] = [
  { id: "MAIOR", nome: "Mais → menos" },
  { id: "MENOR", nome: "Menos → mais" },
  { id: "NOME", nome: "A → Z" },
];

const surgir = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } }),
};

type Opcao<T> = { id: T; nome: string };

export default function MetricasPage() {
  const [dias, setDias] = useState(30);
  const [itemId, setItemId] = useState<string | null>(null);
  const { itens } = useItensCardapio();
  const { categorias } = useCategorias();
  const { metricas, loading, atualizando, erro, refetch } = useMetricas(dias, itemId);
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

          <Cartao indice={4} largo titulo="Dias e horários mais pedidos" subtitulo={itemId ? "Curtidas do item selecionado" : "Curtidas de todos os itens"}>
            <div className={`transition-opacity duration-300 ${atualizando ? "opacity-60" : "opacity-100"}`}>
              <MapaCalorHorarios dados={metricas.curtidasPorHorario} />
            </div>
          </Cartao>

          <CartaoRanking
            {...ranking}
            indice={5}
            tipo="CURTIDOS"
            titulo="Mais curtidos"
            subtitulo="Curtidas que ficaram na aba Curtidos"
            cor="var(--destaque)"
            vazio="Nenhuma curtida no período."
          />
          <CartaoRanking
            {...ranking}
            indice={6}
            tipo="QUASE_PEDIDOS"
            titulo="Quase pedidos"
            subtitulo="Curtidos e depois removidos — bons candidatos a ajuste de preço ou foto"
            cor="var(--principal)"
            vazio="Ninguém desistiu de um prato no período."
          />
          <CartaoRanking
            {...ranking}
            indice={7}
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

function CartaoRanking({ indice, largo, tipo, titulo, subtitulo, cor, vazio, dias, categorias, destaqueId }: CartaoRankingProps) {
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
    <Cartao indice={indice} largo={largo} titulo={titulo} subtitulo={subtitulo}>
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
    </Cartao>
  );
}

type SeletorProps<T> = {
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (id: T) => void;
  className?: string;
};

/** Lista própria em vez de `<select>`: o popup nativo ignora o tema escuro e abre branco no Windows. */
function Seletor<T extends string | null>({ rotulo, opcoes, valor, onChange, className = "sm:w-64" }: SeletorProps<T>) {
  const id = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
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
    <div className={`relative ${className}`} onBlur={(evento) => !evento.currentTarget.contains(evento.relatedTarget) && setAberto(false)}>
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
        aria-label={`${rotulo}: ${opcoes[selecionado]?.nome ?? ""}`}
        className="flex w-full items-center justify-between gap-2 rounded-full bg-(--bg-elevado) px-4 py-2 text-sm ring-1 ring-(--borda) transition outline-none hover:bg-(--superficie-forte) focus-visible:ring-2 focus-visible:ring-(--destaque)/70"
      >
        <span className="truncate">{opcoes[selecionado]?.nome}</span>
        <CaretDownIcon aria-hidden className={`shrink-0 text-(--texto-suave) transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.ul
            ref={listaRef}
            id={`${id}-lista`}
            role="listbox"
            tabIndex={-1}
            aria-label={rotulo}
            aria-activedescendant={`${id}-${ativo}`}
            onKeyDown={teclar}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 border border-(--borda) bg-(--bg-elevado) z-20 mt-2 max-h-80 origin-top overflow-y-auto rounded-2xl p-1.5 shadow-[0_20px_50px_-12px_var(--sombra)] outline-none"
          >
            {opcoes.map((opcao, indice) => (
              <li
                key={opcao.id ?? ""}
                id={`${id}-${indice}`}
                role="option"
                aria-selected={indice === selecionado}
                onClick={() => escolher(indice)}
                onMouseMove={() => setAtivo(indice)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${indice === ativo ? "bg-(--superficie-forte)" : ""} ${indice === selecionado ? "text-(--principal-forte)" : indice === ativo ? "text-(--texto)" : "text-(--texto-suave)"}`}
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
      className="flex flex-col gap-2 rounded-3xl bg-(--bg-elevado) p-4 ring-1 ring-(--borda)"
    >
      <span className="text-lg text-(--principal-forte)">{icone}</span>
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
      className={`rounded-3xl bg-(--bg-elevado) p-5 ring-1 ring-(--borda) ${largo ? "lg:col-span-2" : ""}`}
    >
      <h2 className="font-display text-base font-semibold">{titulo}</h2>
      <p className="mb-4 text-xs text-(--texto-fraco)">{subtitulo}</p>
      {children}
    </motion.section>
  );
}
