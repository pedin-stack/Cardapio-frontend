/**
 * @description Adicionais pagos (10 por página): nome, valor e os pratos que oferecem cada um. Criar e editar numa
 * folha com busca de pratos (e "marcar todos" os filtrados); excluir pede confirmação.
 */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { MagnifyingGlassIcon, PencilSimpleIcon, PlusCircleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { BottomSheet } from "@/components/BottomSheet";
import { Botao } from "@/components/Botao";
import { ConfirmacaoSheet } from "@/components/ConfirmacaoSheet";
import { InputField } from "@/components/inputs/InputField";
import { PainelShell } from "@/components/PainelShell";
import { Paginacao } from "@/components/Paginacao";
import { EmptyState, ErrorState, LoadingState } from "@/components/UIStates";
import { normalizar } from "@/modules/cardapioPublico/utils/buscaExplorar";
import { formatarMoeda } from "@/utils/formatarMoeda";

import { useAdicionaisPagina, useAdicionalAcoes } from "../hooks/useAdicionais";
import { useItensCardapio } from "../hooks/useItensCardapio";
import { ABAS_GESTAO } from "../navegacao";
import type { Adicional } from "../types/gestaoCardapio";

export default function AdicionaisPage() {
  const [page, setPage] = useState(0);
  const { adicionais, totalPages, loading, erro, refetch } = useAdicionaisPagina(page);
  const { excluir } = useAdicionalAcoes();
  /** Adicional em edição; "novo" abre a folha vazia. */
  const [editando, setEditando] = useState<Adicional | "novo" | null>(null);
  const [excluindo, setExcluindo] = useState<Adicional | null>(null);

  // Excluiu o último da última página: volta uma página.
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) setPage(totalPages - 1);
  }, [page, totalPages]);

  const aoExcluir = () => {
    if (!excluindo) return;
    excluir.mutate(excluindo.id, {
      onSuccess: () => {
        toast.success("Adicional excluído.");
        setExcluindo(null);
      },
      onError: (e) => toast.error(mensagemSeguraDeErro(e, "Não foi possível excluir o adicional.")),
    });
  };

  return (
    <PainelShell
      titulo="Adicionais"
      subtitulo="Extras pagos que o cliente soma ao prato (ex.: bacon extra, molho a mais)."
      abas={ABAS_GESTAO}
      acoes={
        <Botao icone={<PlusIcon size={16} weight="bold" aria-hidden />} onClick={() => setEditando("novo")}>
          Novo
        </Botao>
      }
    >
      {loading ? (
        <LoadingState />
      ) : erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : adicionais.length === 0 ? (
        <EmptyState
          icone={<PlusCircleIcon size={44} weight="duotone" aria-hidden />}
          titulo="Nenhum adicional"
          descricao="Crie extras como “Bacon extra” e escolha os pratos que oferecem cada um."
          acao={<Botao onClick={() => setEditando("novo")}>Criar adicional</Botao>}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2 lg:max-w-2xl">
            <AnimatePresence initial={false}>
              {adicionais.map((adicional) => (
                <motion.li
                  key={adicional.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  className="flex items-center gap-2 rounded-2xl bg-(--bg-elevado) p-3 ring-1 ring-(--borda)"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{adicional.nome}</p>
                    <p className="text-sm text-(--texto-suave)">
                      {formatarMoeda(adicional.valor)} · {adicional.itemIds.length} {adicional.itemIds.length === 1 ? "prato" : "pratos"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditando(adicional)}
                    aria-label={`Editar ${adicional.nome}`}
                    className="grid size-9 place-items-center rounded-full hover:bg-(--superficie-forte)"
                  >
                    <PencilSimpleIcon size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExcluindo(adicional)}
                    aria-label={`Excluir ${adicional.nome}`}
                    className="grid size-9 place-items-center rounded-full text-(--perigo) hover:bg-(--perigo)/10"
                  >
                    <TrashIcon size={16} aria-hidden />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <Paginacao page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <FormularioAdicional adicional={editando} onClose={() => setEditando(null)} />

      <ConfirmacaoSheet
        isOpen={Boolean(excluindo)}
        titulo="Excluir este adicional?"
        descricao="Ele sai de todos os pratos que o oferecem. Não dá para desfazer."
        rotuloConfirmar="Excluir adicional"
        perigo
        loading={excluir.isPending}
        onConfirm={aoExcluir}
        onClose={() => setExcluindo(null)}
      />
    </PainelShell>
  );
}

type Erros = { nome?: string; valor?: string };

/** "5,50" ou "5.50" → 5.5; NaN se não for um valor válido com até 2 casas. */
function lerValor(texto: string): number {
  const limpo = texto.trim().replace(/\s|R\$/g, "").replace(",", ".");
  return /^\d{1,8}(\.\d{1,2})?$/.test(limpo) ? Number(limpo) : Number.NaN;
}

function FormularioAdicional({ adicional, onClose }: { adicional: Adicional | "novo" | null; onClose: () => void }) {
  const { salvar } = useAdicionalAcoes();
  const { itens, loading } = useItensCardapio();
  const existente = adicional && adicional !== "novo" ? adicional : null;
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [erros, setErros] = useState<Erros>({});

  // Cada abertura começa do adicional escolhido (ou vazia).
  useEffect(() => {
    if (!adicional) return;
    const atual = adicional === "novo" ? null : adicional;
    setNome(atual?.nome ?? "");
    setValor(atual ? atual.valor.toFixed(2).replace(".", ",") : "");
    setSelecionados(atual?.itemIds ?? []);
    setBusca("");
    setErros({});
  }, [adicional]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    return itens.filter((item) => normalizar(item.nome).includes(termo));
  }, [itens, busca]);
  const todosMarcados = filtrados.length > 0 && filtrados.every((item) => selecionados.includes(item.id));

  const alternar = (itemId: string) =>
    setSelecionados((atual) => (atual.includes(itemId) ? atual.filter((id) => id !== itemId) : [...atual, itemId]));

  const alternarFiltrados = () => {
    const ids = filtrados.map((item) => item.id);
    setSelecionados((atual) => (todosMarcados ? atual.filter((id) => !ids.includes(id)) : [...new Set([...atual, ...ids])]));
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const numero = lerValor(valor);
    // Espelha o AdicionalRequestDTO: nome até 60, valor ≥ 0 com até 2 casas.
    const novos: Erros = {
      nome: nome.trim() ? undefined : "O nome do adicional é obrigatório.",
      valor: Number.isNaN(numero) ? "Informe o valor (ex.: 5,00)." : undefined,
    };
    setErros(novos);
    if (novos.nome || novos.valor) return;
    try {
      await salvar.mutateAsync({ id: existente?.id, payload: { nome: nome.trim(), valor: numero, itemIds: selecionados } });
      toast.success("Adicional salvo. O cardápio atualiza em até 30 segundos.");
      onClose();
    } catch (e) {
      toast.error(mensagemSeguraDeErro(e, "Não foi possível salvar o adicional."));
    }
  };

  return (
    <BottomSheet isOpen={Boolean(adicional)} onClose={onClose} titulo={existente ? "Editar adicional" : "Novo adicional"}>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <InputField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} placeholder="Bacon extra" erro={erros.nome} />
        <InputField label="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="5,00" erro={erros.valor} />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-(--texto-suave)">Pratos que oferecem ({selecionados.length})</legend>
          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-(--superficie) px-4 py-2.5 ring-1 ring-(--borda) focus-within:ring-2 focus-within:ring-(--destaque)/70">
              <MagnifyingGlassIcon size={16} className="shrink-0 text-(--texto-suave)" aria-hidden />
              <span className="sr-only">Buscar prato</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar prato"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-(--texto-fraco)"
              />
            </label>
            <button
              type="button"
              onClick={alternarFiltrados}
              disabled={filtrados.length === 0}
              className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-(--principal-forte) disabled:opacity-40"
            >
              {todosMarcados ? "Desmarcar" : "Marcar"} {busca.trim() ? "filtrados" : "todos"}
            </button>
          </div>
          <ul className="max-h-72 divide-y divide-(--borda) overflow-y-auto rounded-2xl ring-1 ring-(--borda)">
            {loading ? (
              <li className="p-4 text-sm text-(--texto-suave)">Carregando pratos…</li>
            ) : filtrados.length === 0 ? (
              <li className="p-4 text-sm text-(--texto-suave)">Nenhum prato encontrado.</li>
            ) : (
              filtrados.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-(--superficie)">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(item.id)}
                      onChange={() => alternar(item.id)}
                      className="size-4 shrink-0 accent-(--destaque)"
                    />
                    <span className="min-w-0 flex-1 truncate">{item.nome}</span>
                    {!item.ativo && <span className="shrink-0 text-xs text-(--texto-fraco)">oculto</span>}
                  </label>
                </li>
              ))
            )}
          </ul>
        </fieldset>

        <Botao type="submit" loading={salvar.isPending} className="py-3">
          Salvar adicional
        </Botao>
      </form>
    </BottomSheet>
  );
}
