/**
 * @description Categorias do restaurante (lista completa ou página) + mutações (invalidam categorias e itens, que
 * exibem os nomes).
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { atualizarCategoria, criarCategoria, excluirCategoria, listarCategorias, listarCategoriasPagina } from "../services/categoriaService";
import type { CategoriaPayload } from "../types/gestaoCardapio";

export const CHAVE_CATEGORIAS = ["categorias"] as const;
export const CATEGORIAS_POR_PAGINA = 10;

export function useCategorias() {
  const query = useQuery({ queryKey: CHAVE_CATEGORIAS, queryFn: listarCategorias });
  return {
    categorias: query.data ?? [],
    loading: query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar as categorias.") : null,
    refetch: query.refetch,
    ...useCategoriaAcoes(),
  };
}

export function useCategoriasPagina(page: number) {
  const params = { page, size: CATEGORIAS_POR_PAGINA };
  const query = useQuery({
    queryKey: [...CHAVE_CATEGORIAS, "pagina", params],
    queryFn: () => listarCategoriasPagina(params),
    placeholderData: keepPreviousData,
  });
  return {
    categorias: query.data?.content ?? [],
    totalPages: query.data?.totalPages ?? 0,
    totalElements: query.data?.totalElements ?? 0,
    loading: query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar as categorias.") : null,
    refetch: query.refetch,
  };
}

export function useCategoriaAcoes() {
  const queryClient = useQueryClient();
  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: CHAVE_CATEGORIAS });
    queryClient.invalidateQueries({ queryKey: ["itens-cardapio"] });
  };
  const handleFalhar = (erro: unknown) => toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar a categoria."));

  const criar = useMutation({ mutationFn: criarCategoria, onSuccess: invalidar, onError: handleFalhar });
  const atualizar = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoriaPayload }) => atualizarCategoria(id, payload),
    onSuccess: invalidar,
    onError: handleFalhar,
  });
  const excluir = useMutation({ mutationFn: excluirCategoria, onSuccess: invalidar, onError: handleFalhar });

  return { criar, atualizar, excluir };
}
