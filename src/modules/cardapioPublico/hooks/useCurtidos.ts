/**
 * @description Aba "Curtidos" (o carrinho do cardápio). O navegador é a fonte da verdade da UI
 * (localStorage por restaurante); a API recebe cada curtir/descurtir para as métricas. Atualização otimista
 * com rollback se a API recusar.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";

import { curtirItem, descurtirItem } from "../services/cardapioPublicoService";

const chave = (slug: string) => `cardapio-curtidos:${slug}`;

function ler(slug: string): string[] {
  try {
    const bruto = localStorage.getItem(chave(slug));
    const lista: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function gravar(slug: string, ids: string[]) {
  try {
    localStorage.setItem(chave(slug), JSON.stringify(ids));
  } catch {
    // Storage bloqueado: a aba Curtidos vale só até recarregar.
  }
}

export function useCurtidos(slug: string | undefined) {
  /** Mais recente primeiro. */
  const [curtidos, setCurtidos] = useState<string[]>([]);

  useEffect(() => {
    if (slug) setCurtidos(ler(slug));
  }, [slug]);

  const atualizar = useCallback(
    (fn: (ids: string[]) => string[]) => {
      setCurtidos((atual) => {
        const novo = fn(atual);
        if (slug) gravar(slug, novo);
        return novo;
      });
    },
    [slug],
  );

  const alternar = useCallback(
    async (itemId: string) => {
      if (!slug) return;
      const curtir = !curtidos.includes(itemId);
      atualizar((ids) => (curtir ? [itemId, ...ids.filter((id) => id !== itemId)] : ids.filter((id) => id !== itemId)));
      navigator.vibrate?.(curtir ? 12 : 6);
      try {
        await (curtir ? curtirItem(slug, itemId) : descurtirItem(slug, itemId));
      } catch (erro) {
        atualizar((ids) => (curtir ? ids.filter((id) => id !== itemId) : [itemId, ...ids]));
        toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar sua curtida."));
      }
    },
    [slug, curtidos, atualizar],
  );

  return { curtidos, alternar, isCurtido: (itemId: string) => curtidos.includes(itemId) };
}
