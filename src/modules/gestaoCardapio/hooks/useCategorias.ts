/**
 * @description Categorias do restaurante + mutações (invalidam categorias e itens, que exibem os nomes).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { atualizarCategoria, criarCategoria, excluirCategoria, listarCategorias } from "../services/categoriaService";
import type { CategoriaPayload } from "../types/gestaoCardapio";

export const CHAVE_CATEGORIAS = ["categorias"] as const;

export function useCategorias() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: CHAVE_CATEGORIAS, queryFn: listarCategorias });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: CHAVE_CATEGORIAS });
    queryClient.invalidateQueries({ queryKey: ["itens-cardapio"] });
  };
  const aoFalhar = (erro: unknown) => toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar a categoria."));

  const criar = useMutation({ mutationFn: criarCategoria, onSuccess: invalidar, onError: aoFalhar });
  const atualizar = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoriaPayload }) => atualizarCategoria(id, payload),
    onSuccess: invalidar,
    onError: aoFalhar,
  });
  const excluir = useMutation({ mutationFn: excluirCategoria, onSuccess: invalidar, onError: aoFalhar });

  return {
    categorias: query.data ?? [],
    loading: query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar as categorias.") : null,
    refetch: query.refetch,
    criar,
    atualizar,
    excluir,
  };
}
