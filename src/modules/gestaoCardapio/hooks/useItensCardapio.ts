/**
 * @description Itens do cardápio (lista e detalhe). Enquanto algum vídeo está PROCESSANDO, refaz a consulta
 * a cada 5 s para o status virar PRONTO sozinho na tela.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { atualizarItem, buscarItem, criarItem, excluirItem, listarItens } from "../services/itemCardapioService";
import type { ItemCardapio, ItemCardapioPayload } from "../types/gestaoCardapio";

export const CHAVE_ITENS = ["itens-cardapio"] as const;
const INTERVALO_STATUS_VIDEO_MS = 5_000;

const processando = (itens: ItemCardapio[] | undefined) => Boolean(itens?.some((item) => item.video.status === "PROCESSANDO"));

export function useItensCardapio() {
  const query = useQuery({
    queryKey: [...CHAVE_ITENS, "lista"],
    queryFn: listarItens,
    refetchInterval: (q) => (processando(q.state.data) ? INTERVALO_STATUS_VIDEO_MS : false),
  });
  return {
    itens: query.data ?? [],
    loading: query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar os itens.") : null,
    refetch: query.refetch,
  };
}

export function useItemCardapio(id: string | undefined) {
  const query = useQuery({
    queryKey: [...CHAVE_ITENS, "item", id],
    queryFn: () => buscarItem(id as string),
    enabled: Boolean(id),
    refetchInterval: (q) => (q.state.data?.video.status === "PROCESSANDO" ? INTERVALO_STATUS_VIDEO_MS : false),
  });
  return {
    item: query.data,
    loading: query.isPending && Boolean(id),
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar o item.") : null,
    refetch: query.refetch,
  };
}

export function useItemCardapioAcoes() {
  const queryClient = useQueryClient();
  const invalidar = () => queryClient.invalidateQueries({ queryKey: CHAVE_ITENS });

  const salvar = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: ItemCardapioPayload }) =>
      id ? atualizarItem(id, payload) : criarItem(payload),
    onSuccess: invalidar,
  });
  const excluir = useMutation({ mutationFn: excluirItem, onSuccess: invalidar });
  return { salvar, excluir };
}
