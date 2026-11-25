/**
 * @description Comentários de um item no painel (paginados) e a moderação (apagar).
 */
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { excluirComentario, listarComentariosItem } from "../services/itemCardapioService";

const CHAVE_COMENTARIOS_ITEM = ["comentarios-item"] as const;

export function useComentariosItem(itemId: string, onApagado: () => void) {
  const queryClient = useQueryClient();
  const chave = [...CHAVE_COMENTARIOS_ITEM, itemId];

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
      onApagado();
      queryClient.invalidateQueries({ queryKey: chave });
    },
    onError: (e) => toast.error(mensagemSeguraDeErro(e, "Não foi possível apagar o comentário.")),
  });

  return {
    comentarios: query.data?.pages.flatMap((pagina) => pagina.content) ?? [],
    loading: query.isPending,
    erro: query.isError ? mensagemSeguraDeErro(query.error, "Não foi possível carregar os comentários.") : null,
    temMais: query.hasNextPage,
    carregandoMais: query.isFetchingNextPage,
    carregarMais: () => query.fetchNextPage(),
    apagando: apagar.isPending,
    apagar: apagar.mutate,
  };
}
