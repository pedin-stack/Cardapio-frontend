/**
 * @description Métricas do período. Ao trocar o filtro, mantém o resultado anterior (esmaecido) até o novo
 * chegar — sem "piscar" esqueleto.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { buscarMetricas } from "../services/metricaService";

/** AAAA-MM-DD no fuso do navegador (o back interpreta como data local do restaurante). */
function dataLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function useMetricas(dias: number, itemId: string | null) {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(fim.getDate() - (dias - 1));
  const params = { inicio: dataLocal(inicio), fim: dataLocal(fim), itemId: itemId ?? undefined };

  const query = useQuery({
    queryKey: ["metricas", params],
    queryFn: () => buscarMetricas(params),
    placeholderData: keepPreviousData,
  });

  return {
    metricas: query.data,
    loading: query.isPending,
    atualizando: query.isFetching && !query.isPending,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar as métricas.") : null,
    refetch: query.refetch,
  };
}
