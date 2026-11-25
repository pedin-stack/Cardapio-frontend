/**
 * @description Comentários públicos de um prato: lista paginada (mais novos primeiro) e a publicação, que pede a
 * identificação a quem ainda não se identificou.
 */
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro, statusDoErro } from "@/api/mensagemErro";

import { comentarItem, listarComentarios } from "../services/cardapioPublicoService";
import { CHAVE_CARDAPIO } from "./useCardapioPublico";
import type { ClienteCardapio } from "./useCliente";

const CHAVE_COMENTARIOS = ["comentarios"] as const;

export function useComentarios(slug: string, itemId: string, cliente: ClienteCardapio, onPublicado: () => void) {
  const queryClient = useQueryClient();
  const chave = [...CHAVE_COMENTARIOS, slug, itemId];

  const query = useInfiniteQuery({
    queryKey: chave,
    queryFn: ({ pageParam }) => listarComentarios(slug, itemId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.number + 1 < ultima.totalPages ? ultima.number + 1 : undefined),
  });

  const comentar = useMutation({
    mutationFn: ({ token, mensagem }: { token: string; mensagem: string }) => comentarItem(slug, itemId, mensagem, token),
    onSuccess: () => {
      onPublicado();
      queryClient.invalidateQueries({ queryKey: chave });
      // A contagem do card vem no cardápio.
      queryClient.invalidateQueries({ queryKey: [...CHAVE_CARDAPIO, slug] });
    },
    onError: (erro, { mensagem }) => {
      // Token recusado (cadastro apagado, outro restaurante): identifica de novo e publica o mesmo texto.
      if (statusDoErro(erro) === 401) cliente.esquecer((token) => comentar.mutate({ token, mensagem }));
      else toast.error(mensagemSeguraDeErro(erro, "Não foi possível publicar o comentário."));
    },
  });

  return {
    comentarios: query.data?.pages.flatMap((pagina) => pagina.content) ?? [],
    loading: query.isPending,
    erro: query.isError,
    temMais: query.hasNextPage,
    carregandoMais: query.isFetchingNextPage,
    carregarMais: () => query.fetchNextPage(),
    publicando: comentar.isPending,
    publicar: (mensagem: string) => cliente.exigir((token) => comentar.mutate({ token, mensagem })),
  };
}
