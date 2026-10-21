/**
 * @description Comentários que os clientes deixaram no item (os mais novos primeiro), com "apagar" para moderar.
 */
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { ChatCircleIcon, TrashIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { ConfirmacaoSheet } from "@/components/ConfirmacaoSheet";

import { excluirComentario, listarComentariosItem } from "../services/itemCardapioService";
import type { ComentarioItem } from "../types/gestaoCardapio";

const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function ComentariosItem({ itemId }: { itemId: string }) {
  const queryClient = useQueryClient();
  const [apagando, setApagando] = useState<ComentarioItem | null>(null);
  const chave = ["comentarios-item", itemId];

  const query = useInfiniteQuery({
    queryKey: chave,
    queryFn: ({ pageParam }) => listarComentariosItem(itemId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.number + 1 < ultima.totalPages ? ultima.number + 1 : undefined),
  });
  const apagar = useMutation({
    mutationFn: excluirComentario,
    onSuccess: () => {
      toast.success("Comentário apagado.");
      setApagando(null);
      queryClient.invalidateQueries({ queryKey: chave });
    },
    onError: (e) => toast.error(mensagemSeguraDeErro(e, "Não foi possível apagar o comentário.")),
  });

  const comentarios = query.data?.pages.flatMap((pagina) => pagina.content) ?? [];

  return (
    <section aria-labelledby="comentarios-item" className="mt-8 flex flex-col gap-3 rounded-3xl bg-(--bg-elevado) p-4 ring-1 ring-(--borda) lg:p-6">
      <h2 id="comentarios-item" className="font-display text-lg font-semibold">
        Comentários dos clientes
      </h2>

      {query.isPending ? (
        <div className="h-16 rounded-2xl shimmer" role="status" aria-label="Carregando comentários" />
      ) : query.isError ? (
        <p className="text-sm text-(--texto-suave)">{mensagemSeguraDeErro(query.error, "Não foi possível carregar os comentários.")}</p>
      ) : comentarios.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-(--texto-suave)">
          <ChatCircleIcon size={18} aria-hidden /> Ninguém comentou este prato ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {comentarios.map((comentario) => (
              <motion.li
                key={comentario.id}
                layout
                exit={{ opacity: 0, x: -60 }}
                className="flex items-start gap-3 rounded-2xl bg-(--superficie) px-4 py-3 ring-1 ring-(--borda)"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{comentario.autor}</span>
                    <span className="ml-2 text-xs text-(--texto-fraco)">{quando(comentario.criadoEm)}</span>
                  </p>
                  <p className="mt-1 text-sm break-words whitespace-pre-line text-(--texto-suave)">{comentario.texto}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setApagando(comentario)}
                  aria-label={`Apagar comentário de ${comentario.autor}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-(--perigo) hover:bg-(--perigo)/10"
                >
                  <TrashIcon size={16} aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="self-start rounded-full px-3 py-2 text-sm font-medium text-(--principal-forte) disabled:opacity-50"
        >
          {query.isFetchingNextPage ? "Carregando…" : "Ver mais comentários"}
        </button>
      )}

      <ConfirmacaoSheet
        isOpen={Boolean(apagando)}
        titulo="Apagar este comentário?"
        descricao="Ele some do cardápio. Não dá para desfazer."
        rotuloConfirmar="Apagar comentário"
        perigo
        loading={apagar.isPending}
        onConfirm={() => apagando && apagar.mutate(apagando.id)}
        onClose={() => setApagando(null)}
      />
    </section>
  );
}
