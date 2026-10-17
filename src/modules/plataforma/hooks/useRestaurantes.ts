/**
 * @description Restaurantes da plataforma: lista paginada com busca (debounce 300 ms), detalhe e mutações.
 * O status é otimista: o interruptor responde na hora e volta se a API recusar.
 */
import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import type { Pagina } from "@/types/api";

import {
  atualizarRestaurante,
  atualizarStatusRestaurante,
  buscarRestaurante,
  criarRestaurante,
  excluirRestaurante,
  listarRestaurantes,
} from "../services/restauranteService";
import type { Restaurante, RestauranteAtualizarPayload, RestaurantePayload } from "../types/restaurante";

const CHAVE = ["restaurantes"] as const;
const POR_PAGINA = 12;

export function useRestaurantesPesquisa() {
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [busca]);

  const params = { nome: buscaAplicada || undefined, page, size: POR_PAGINA };
  const query = useQuery({
    queryKey: [...CHAVE, "pesquisa", params],
    queryFn: () => listarRestaurantes(params),
    placeholderData: keepPreviousData,
  });

  return {
    restaurantes: query.data?.content ?? [],
    totalPages: query.data?.totalPages ?? 0,
    page,
    irPara: setPage,
    busca,
    setBusca,
    loading: query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar os restaurantes.") : null,
    refetch: query.refetch,
  };
}

export function useRestaurante(id: string | undefined) {
  const query = useQuery({ queryKey: [...CHAVE, "detalhe", id], queryFn: () => buscarRestaurante(id as string), enabled: Boolean(id) });
  return {
    restaurante: query.data,
    loading: query.isPending && Boolean(id),
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar o restaurante.") : null,
    refetch: query.refetch,
  };
}

export function useRestauranteAcoes() {
  const queryClient = useQueryClient();
  const invalidar = () => queryClient.invalidateQueries({ queryKey: CHAVE });

  const criar = useMutation({ mutationFn: (payload: RestaurantePayload) => criarRestaurante(payload), onSuccess: invalidar });
  const atualizar = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RestauranteAtualizarPayload }) => atualizarRestaurante(id, payload),
    onSuccess: invalidar,
  });
  const excluir = useMutation({ mutationFn: excluirRestaurante, onSuccess: invalidar });

  const alternarStatus = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarStatusRestaurante(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await queryClient.cancelQueries({ queryKey: CHAVE });
      const anteriores = queryClient.getQueriesData<Pagina<Restaurante>>({ queryKey: [...CHAVE, "pesquisa"] });
      queryClient.setQueriesData<Pagina<Restaurante>>({ queryKey: [...CHAVE, "pesquisa"] }, (pagina) =>
        pagina ? { ...pagina, content: pagina.content.map((r) => (r.id === id ? { ...r, ativo } : r)) } : pagina,
      );
      return { anteriores };
    },
    onError: (erro, _vars, contexto) => {
      contexto?.anteriores.forEach(([chave, dados]) => queryClient.setQueryData(chave, dados));
      toast.error(mensagemSeguraDeErro(erro, "Não foi possível alterar o status."));
    },
    onSuccess: (restaurante) =>
      toast.success(restaurante.ativo ? `${restaurante.nome} está no ar.` : `${restaurante.nome} foi desativado.`),
    onSettled: invalidar,
  });

  return { criar, atualizar, excluir, alternarStatus };
}
