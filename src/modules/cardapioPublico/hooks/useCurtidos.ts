/**
 * @description Aba "Curtidos" (o carrinho do cardápio). O navegador é a fonte da verdade da UI
 * (localStorage por restaurante); a API recebe cada curtir/descurtir para as métricas. Atualização otimista
 * com rollback se a API recusar. Quantidade, especificações e adicionais escolhidos ficam só no navegador
 * (são para o garçom). Tudo some 4 h depois da última mexida (ver `esquecerSeVencido`).
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { esquecerSeVencido, renovarValidade } from "@/utils/dispositivo";

import { curtirItem, descurtirItem } from "../services/cardapioPublicoService";
import type { ItemPublico } from "../types/cardapioPublico";

const chave = (slug: string) => `cardapio-curtidos:${slug}`;
/** Quantidade e escolhas ficam numa chave à parte: a lista antiga continua válida nos navegadores. */
const chaveDetalhes = (slug: string) => `cardapio-curtidos-detalhes:${slug}`;

export const QUANTIDADE_MAXIMA = 99;

/** Por item: quantidade pedida, a opção escolhida em cada especificação (grupo → opção) e os adicionais marcados. */
export type DetalheCurtido = { quantidade: number; escolhas: Record<string, string>; adicionais?: string[] };

/** Valor de uma unidade com os adicionais marcados que o item ainda oferece (o gestor pode ter mudado). */
export function precoUnitario(item: ItemPublico, adicionalIds: string[]): number {
  return item.adicionais.reduce((total, adicional) => (adicionalIds.includes(adicional.id) ? total + adicional.valor : total), item.valor);
}

function ler(slug: string): string[] {
  try {
    const bruto = localStorage.getItem(chave(slug));
    const lista: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function lerDetalhes(slug: string): Record<string, DetalheCurtido> {
  try {
    const bruto = localStorage.getItem(chaveDetalhes(slug));
    const mapa: unknown = bruto ? JSON.parse(bruto) : {};
    return mapa && typeof mapa === "object" && !Array.isArray(mapa) ? (mapa as Record<string, DetalheCurtido>) : {};
  } catch {
    return {};
  }
}

function gravar(chaveStorage: string, valor: unknown) {
  try {
    localStorage.setItem(chaveStorage, JSON.stringify(valor));
    renovarValidade();
  } catch {
    // Storage bloqueado: a aba Curtidos vale só até recarregar.
  }
}

export function useCurtidos(slug: string | undefined) {
  /** Mais recente primeiro. */
  const [curtidos, setCurtidos] = useState<string[]>([]);
  const [detalhes, setDetalhes] = useState<Record<string, DetalheCurtido>>({});

  useEffect(() => {
    if (!slug) return;
    esquecerSeVencido();
    setCurtidos(ler(slug));
    setDetalhes(lerDetalhes(slug));
  }, [slug]);

  const atualizarDetalhe = useCallback(
    (itemId: string, fn: (atual: DetalheCurtido) => DetalheCurtido | null) => {
      setDetalhes((mapa) => {
        const novo = { ...mapa };
        const resultado = fn(mapa[itemId] ?? { quantidade: 1, escolhas: {} });
        if (resultado) novo[itemId] = resultado;
        else delete novo[itemId];
        if (slug) gravar(chaveDetalhes(slug), novo);
        return novo;
      });
    },
    [slug],
  );

  const atualizar = useCallback(
    (fn: (ids: string[]) => string[]) => {
      setCurtidos((atual) => {
        const novo = fn(atual);
        if (slug) gravar(chave(slug), novo);
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
      // Descurtir zera a quantidade e as escolhas do item.
      if (!curtir) atualizarDetalhe(itemId, () => null);
      navigator.vibrate?.(curtir ? 12 : 6);
      try {
        await (curtir ? curtirItem(slug, itemId) : descurtirItem(slug, itemId));
      } catch (erro) {
        atualizar((ids) => (curtir ? ids.filter((id) => id !== itemId) : [itemId, ...ids]));
        toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar sua curtida."));
      }
    },
    [slug, curtidos, atualizar, atualizarDetalhe],
  );

  const definirQuantidade = useCallback(
    (itemId: string, quantidade: number) =>
      atualizarDetalhe(itemId, (atual) => ({ ...atual, quantidade: Math.min(QUANTIDADE_MAXIMA, Math.max(1, quantidade)) })),
    [atualizarDetalhe],
  );

  const escolher = useCallback(
    (itemId: string, grupo: string, opcao: string) =>
      atualizarDetalhe(itemId, (atual) => ({ ...atual, escolhas: { ...atual.escolhas, [grupo]: opcao } })),
    [atualizarDetalhe],
  );

  const alternarAdicional = useCallback(
    (itemId: string, adicionalId: string) =>
      atualizarDetalhe(itemId, (atual) => {
        const marcados = atual.adicionais ?? [];
        return { ...atual, adicionais: marcados.includes(adicionalId) ? marcados.filter((id) => id !== adicionalId) : [...marcados, adicionalId] };
      }),
    [atualizarDetalhe],
  );

  return {
    curtidos,
    alternar,
    isCurtido: (itemId: string) => curtidos.includes(itemId),
    quantidade: (itemId: string) => detalhes[itemId]?.quantidade ?? 1,
    escolhas: (itemId: string) => detalhes[itemId]?.escolhas ?? {},
    adicionais: (itemId: string) => detalhes[itemId]?.adicionais ?? [],
    definirQuantidade,
    escolher,
    alternarAdicional,
  };
}
