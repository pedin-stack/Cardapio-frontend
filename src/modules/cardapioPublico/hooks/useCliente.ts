/**
 * @description Cliente identificado no cardápio (para comentar e avaliar). O navegador guarda, por restaurante, o
 * token + nome (e as estrelas que deu) ou a escolha "sem login". `exigir` abre a identificação quando preciso e
 * roda a ação pendente assim que o cliente se identifica.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { identificarCliente } from "../services/cardapioPublicoService";
import type { IdentificacaoCliente } from "../types/cardapioPublico";

const chave = (slug: string) => `cardapio-cliente:${slug}`;

type ClienteIdentificado = { token: string; nome: string; avaliacoes: Record<string, number> };
/** null = ainda não decidiu (o modal da entrada abre); "anonimo" = escolheu seguir sem login. */
type Estado = ClienteIdentificado | "anonimo" | null;
type Acao = (token: string) => void;

function ler(slug: string): Estado {
  try {
    const bruto = localStorage.getItem(chave(slug));
    const valor: unknown = bruto ? JSON.parse(bruto) : null;
    if (valor === "anonimo") return "anonimo";
    if (valor && typeof valor === "object" && typeof (valor as ClienteIdentificado).token === "string") {
      const { token, nome, avaliacoes } = valor as ClienteIdentificado;
      return { token, nome: String(nome ?? ""), avaliacoes: avaliacoes && typeof avaliacoes === "object" ? avaliacoes : {} };
    }
    return null;
  } catch {
    return null;
  }
}

function gravar(slug: string, estado: Estado) {
  try {
    localStorage.setItem(chave(slug), JSON.stringify(estado));
  } catch {
    // Storage bloqueado: a identificação vale só até recarregar.
  }
}

export function useCliente(slug: string | undefined) {
  const [estado, setEstado] = useState<Estado>(null);
  const [carregado, setCarregado] = useState(false);
  /** Formulário aberto por uma ação que exige identificação (pula o passo "identificar ou seguir sem login"). */
  const [pedindo, setPedindo] = useState(false);
  const pendente = useRef<Acao | null>(null);

  useEffect(() => {
    if (!slug) return;
    setEstado(ler(slug));
    setCarregado(true);
  }, [slug]);

  const atualizar = useCallback(
    (fn: (atual: Estado) => Estado) => {
      setEstado((atual) => {
        const novo = fn(atual);
        if (slug) gravar(slug, novo);
        return novo;
      });
    },
    [slug],
  );

  const cliente = estado && estado !== "anonimo" ? estado : null;

  const identificar = useCallback(
    async (dados: IdentificacaoCliente) => {
      if (!slug) return;
      const sessao = await identificarCliente(slug, dados);
      atualizar(() => ({ token: sessao.token, nome: sessao.nome, avaliacoes: {} }));
      setPedindo(false);
      pendente.current?.(sessao.token);
      pendente.current = null;
    },
    [slug, atualizar],
  );

  /** Fechar o modal também conta como "sem login" (não insiste a cada visita). */
  const continuarSemLogin = useCallback(() => {
    atualizar((atual) => atual ?? "anonimo");
    setPedindo(false);
    pendente.current = null;
  }, [atualizar]);

  /** Roda a ação com o token; sem cliente, abre o formulário e roda depois da identificação. */
  const exigir = useCallback(
    (acao: Acao) => {
      if (cliente) {
        acao(cliente.token);
        return;
      }
      pendente.current = acao;
      setPedindo(true);
    },
    [cliente],
  );

  /** A API recusou o token (401): volta a "sem login" e pede a identificação de novo para refazer a ação. */
  const esquecer = useCallback(
    (refazer?: Acao) => {
      atualizar(() => "anonimo");
      pendente.current = refazer ?? null;
      setPedindo(true);
    },
    [atualizar],
  );

  const lembrarAvaliacao = useCallback(
    (itemId: string, estrelas: number) =>
      atualizar((atual) => (atual && atual !== "anonimo" ? { ...atual, avaliacoes: { ...atual.avaliacoes, [itemId]: estrelas } } : atual)),
    [atualizar],
  );

  return {
    cliente,
    /** Primeira visita: ainda não escolheu entre identificar-se e seguir sem login. */
    precisaDecidir: carregado && estado === null,
    pedindo,
    identificar,
    continuarSemLogin,
    exigir,
    esquecer,
    lembrarAvaliacao,
    minhaAvaliacao: (itemId: string) => cliente?.avaliacoes[itemId] ?? 0,
  };
}

export type ClienteCardapio = ReturnType<typeof useCliente>;
