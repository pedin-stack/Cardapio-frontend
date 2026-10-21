/**
 * @description Categorias personalizadas do restaurante (10 por página): criar, renomear, arrastar para ordenar
 * (dentro da página) e excluir.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { CheckIcon, DotsSixVerticalIcon, PencilSimpleIcon, PlusIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";

import { ConfirmacaoSheet } from "@/components/ConfirmacaoSheet";
import { PainelShell } from "@/components/PainelShell";
import { Paginacao } from "@/components/Paginacao";
import { EmptyState, ErrorState, LoadingState } from "@/components/UIStates";

import { CATEGORIAS_POR_PAGINA, useCategoriaAcoes, useCategoriasPagina } from "../hooks/useCategorias";
import { ABAS_GESTAO } from "../navegacao";
import type { Categoria } from "../types/gestaoCardapio";

export default function CategoriasPage() {
  const [page, setPage] = useState(0);
  const { categorias, totalPages, totalElements, loading, erro, refetch } = useCategoriasPagina(page);
  const { criar, atualizar, excluir } = useCategoriaAcoes();
  const [ordem, setOrdem] = useState<Categoria[]>([]);
  const [nova, setNova] = useState("");
  const [editando, setEditando] = useState<{ id: string; nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState<Categoria | null>(null);

  useEffect(() => setOrdem(categorias), [categorias]);
  // Excluiu a última categoria da última página: volta uma página.
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) setPage(totalPages - 1);
  }, [page, totalPages]);

  // Entra no fim da lista; abre a página onde ela caiu.
  const adicionar = () => {
    const nome = nova.trim();
    if (!nome) return;
    criar.mutate(
      { nome, ordem: totalElements },
      {
        onSuccess: () => {
          setNova("");
          setPage(Math.floor(totalElements / CATEGORIAS_POR_PAGINA));
        },
      },
    );
  };

  // Ao soltar, grava só as categorias cuja posição mudou. Arrastar vale dentro da página: a posição soma as anteriores.
  const salvarOrdem = () => {
    ordem.forEach((categoria, indice) => {
      const posicao = page * CATEGORIAS_POR_PAGINA + indice;
      if (categoria.ordem !== posicao) atualizar.mutate({ id: categoria.id, payload: { nome: categoria.nome, ordem: posicao } });
    });
  };

  const salvarNome = () => {
    if (!editando) return;
    const nome = editando.nome.trim();
    const categoria = categorias.find((c) => c.id === editando.id);
    if (categoria && nome && nome !== categoria.nome) {
      atualizar.mutate({ id: categoria.id, payload: { nome, ordem: categoria.ordem } });
    }
    setEditando(null);
  };

  return (
    <PainelShell titulo="Categorias" subtitulo="Os chips do topo do cardápio. Arraste para mudar a ordem." abas={ABAS_GESTAO}>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          adicionar();
        }}
        className="mb-5 flex gap-2 lg:max-w-2xl"
      >
        <input
          value={nova}
          onChange={(evento) => setNova(evento.target.value)}
          maxLength={60}
          placeholder="Nova categoria (ex.: Sobremesas)"
          aria-label="Nova categoria"
          className="min-w-0 flex-1 rounded-full bg-(--bg-elevado) px-5 py-3 ring-1 ring-(--borda) outline-none focus:ring-2 focus:ring-(--destaque)/70"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}
          disabled={!nova.trim() || criar.isPending}
          aria-label="Adicionar categoria"
          className="grid size-12 shrink-0 place-items-center rounded-full gradiente-destaque text-(--sobre-destaque) disabled:opacity-40"
        >
          <PlusIcon size={20} weight="bold" aria-hidden />
        </motion.button>
      </form>

      {loading ? (
        <LoadingState />
      ) : erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : ordem.length === 0 ? (
        <EmptyState icone={<TagIcon size={44} weight="duotone" aria-hidden />} titulo="Nenhuma categoria" descricao="Crie categorias como Cafés, Doces ou Bebidas." />
      ) : (
        <Reorder.Group axis="y" values={ordem} onReorder={setOrdem} className="flex flex-col gap-2 lg:max-w-2xl">
          <AnimatePresence initial={false}>
            {ordem.map((categoria) => (
              <Reorder.Item
                key={categoria.id}
                value={categoria}
                onDragEnd={salvarOrdem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                whileDrag={{ scale: 1.03, boxShadow: "0 20px 40px -12px rgba(23,37,43,0.35)" }}
                className="flex items-center gap-2 rounded-2xl bg-(--bg-elevado) p-2 pl-1 ring-1 ring-(--borda)"
              >
                <DotsSixVerticalIcon size={22} className="shrink-0 cursor-grab text-(--texto-fraco) active:cursor-grabbing" aria-label="Arrastar" />
                {editando?.id === categoria.id ? (
                  <input
                    autoFocus
                    value={editando.nome}
                    onChange={(evento) => setEditando({ id: categoria.id, nome: evento.target.value })}
                    onKeyDown={(evento) => evento.key === "Enter" && salvarNome()}
                    onBlur={salvarNome}
                    maxLength={60}
                    aria-label="Nome da categoria"
                    className="min-w-0 flex-1 rounded-xl bg-(--superficie-forte) px-3 py-2 outline-none focus:ring-2 focus:ring-(--destaque)/70"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate px-1 font-medium">{categoria.nome}</span>
                )}
                <button
                  type="button"
                  onClick={() => (editando?.id === categoria.id ? salvarNome() : setEditando({ id: categoria.id, nome: categoria.nome }))}
                  aria-label={editando?.id === categoria.id ? "Salvar nome" : `Renomear ${categoria.nome}`}
                  className="grid size-9 place-items-center rounded-full hover:bg-(--superficie-forte)"
                >
                  {editando?.id === categoria.id ? <CheckIcon size={16} weight="bold" aria-hidden /> : <PencilSimpleIcon size={16} aria-hidden />}
                </button>
                <button
                  type="button"
                  onClick={() => setExcluindo(categoria)}
                  aria-label={`Excluir ${categoria.nome}`}
                  className="grid size-9 place-items-center rounded-full text-(--perigo) hover:bg-(--perigo)/10"
                >
                  <TrashIcon size={16} aria-hidden />
                </button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      <Paginacao page={page} totalPages={totalPages} onChange={setPage} className="mt-6 lg:max-w-2xl" />

      <ConfirmacaoSheet
        isOpen={Boolean(excluindo)}
        titulo={`Excluir "${excluindo?.nome ?? ""}"?`}
        descricao="Os itens continuam no cardápio; só perdem esta categoria."
        rotuloConfirmar="Excluir categoria"
        perigo
        loading={excluir.isPending}
        onConfirm={() => excluindo && excluir.mutate(excluindo.id, { onSuccess: () => setExcluindo(null) })}
        onClose={() => setExcluindo(null)}
      />
    </PainelShell>
  );
}
