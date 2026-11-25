/**
 * @description O restaurante do gestor e o salvar da aparência.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { atualizarAparencia, buscarMeuRestaurante } from "../services/meuRestauranteService";

const CHAVE_MEU_RESTAURANTE = ["meu-restaurante"] as const;

export function useMeuRestaurante() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: CHAVE_MEU_RESTAURANTE,
    queryFn: buscarMeuRestaurante,
    // Acompanha o vídeo da capa até ficar pronto.
    refetchInterval: (q) => (q.state.data?.video.status === "PROCESSANDO" ? 5000 : false),
  });

  const salvar = useMutation({
    mutationFn: atualizarAparencia,
    onSuccess: (restaurante) => {
      queryClient.setQueryData(CHAVE_MEU_RESTAURANTE, restaurante);
      toast.success(
        restaurante.video.status === "PROCESSANDO"
          ? "Salvo! O vídeo da capa está sendo processado."
          : "Aparência salva. O cardápio atualiza em até 30 segundos.",
      );
    },
    onError: (erro) => toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar a aparência.")),
  });

  return {
    restaurante: query.data,
    erro: query.error ? mensagemSeguraDeErro(query.error, "Não foi possível carregar o restaurante.") : null,
    refetch: query.refetch,
    salvando: salvar.isPending,
    salvar: salvar.mutate,
  };
}
