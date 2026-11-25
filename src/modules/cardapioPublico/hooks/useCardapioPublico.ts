/**
 * @description Cardápio público de um restaurante. `indisponivel` = 404 (restaurante inexistente ou desativado).
 */
import { useQuery } from "@tanstack/react-query";

import { mensagemSeguraDeErro, statusDoErro } from "@/api/mensagemErro";

import { buscarCardapio } from "../services/cardapioPublicoService";

export const CHAVE_CARDAPIO = ["cardapio-publico"] as const;

export function useCardapioPublico(slug: string | undefined) {
  const query = useQuery({
    queryKey: [...CHAVE_CARDAPIO, slug],
    queryFn: () => buscarCardapio(slug as string),
    enabled: Boolean(slug),
    staleTime: 30_000,
  });

  return {
    cardapio: query.data,
    loading: query.isPending,
    indisponivel: statusDoErro(query.error) === 404,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar o cardápio.") : null,
    refetch: query.refetch,
  };
}
