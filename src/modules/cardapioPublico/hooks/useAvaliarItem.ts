/**
 * @description Avaliação (estrelas) do cliente: mostra a nota na hora e desfaz se a API recusar.
 */
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro, statusDoErro } from "@/api/mensagemErro";

import { avaliarItem } from "../services/cardapioPublicoService";
import { CHAVE_CARDAPIO } from "./useCardapioPublico";
import type { ClienteCardapio } from "./useCliente";

export function useAvaliarItem(slug: string, cliente: ClienteCardapio) {
  const queryClient = useQueryClient();

  return (itemId: string, estrelas: number) => {
    const enviar = async (token: string) => {
      const anterior = cliente.minhaAvaliacao(itemId);
      cliente.lembrarAvaliacao(itemId, estrelas);
      try {
        await avaliarItem(slug, itemId, estrelas, token);
        // A média do card vem no cardápio.
        queryClient.invalidateQueries({ queryKey: [...CHAVE_CARDAPIO, slug] });
      } catch (erro) {
        cliente.lembrarAvaliacao(itemId, anterior);
        if (statusDoErro(erro) === 401) cliente.esquecer(enviar);
        else toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar sua avaliação."));
      }
    };
    cliente.exigir(enviar);
  };
}
