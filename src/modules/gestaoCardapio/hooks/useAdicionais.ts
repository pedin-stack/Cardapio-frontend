/**
 * @description Adicionais do restaurante (página) + mutações.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { atualizarAdicional, criarAdicional, excluirAdicional, listarAdicionaisPagina } from "../services/adicionalService";
import type { AdicionalPayload } from "../types/gestaoCardapio";

const CHAVE_ADICIONAIS = ["adicionais"] as const;
export const ADICIONAIS_POR_PAGINA = 10;

export function useAdicionaisPagina(page: number) {
  const params = { page, size: ADICIONAIS_POR_PAGINA };
  const query = useQuery({
    queryKey: [...CHAVE_ADICIONAIS, params],
    queryFn: () => listarAdicionaisPagina(params),
    placeholderData: keepPreviousData,
  });
  return {
    adicionais: query.data?.content ?? [],
    totalPages: query.data?.totalPages ?? 0,
    loading: query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar os adicionais.") : null,
    refetch: query.refetch,
  };
}

export function useAdicionalAcoes() {
  const queryClient = useQueryClient();
  const invalidar = () => queryClient.invalidateQueries({ queryKey: CHAVE_ADICIONAIS });

  const salvar = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: AdicionalPayload }) => (id ? atualizarAdicional(id, payload) : criarAdicional(payload)),
    onSuccess: invalidar,
  });
  const excluir = useMutation({ mutationFn: excluirAdicional, onSuccess: invalidar });
  return { salvar, excluir };
}
