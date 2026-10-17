/**
 * @description Sessão do painel sobre o React Query (sem Provider): `meus-dados` só é buscado quando há
 * marcador de sessão; login semeia o cache; logout limpa tudo e recarrega a app.
 */
import { useCallback, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { gravarMarcadorSessao, limparMarcadorSessao, temMarcadorSessao } from "@/auth/sessionCookies";
import type { Permissao } from "@/types/permissoes";
import { buscarMeusDados, criarSessao, excluirSessao } from "@/modules/core/autenticacao/services/autenticacaoService";
import type { LoginPayload, UsuarioSessao } from "@/modules/core/autenticacao/types/sessao";

export const CHAVE_SESSAO = ["sessao", "meus-dados"] as const;

const nadaMuda = () => () => undefined;

export function useAuth() {
  const queryClient = useQueryClient();
  // Cookie só existe no navegador: no SSR do Next o marcador é "desconhecido" (null).
  const marcador = useSyncExternalStore(nadaMuda, temMarcadorSessao, () => null);

  const sessao = useQuery({
    queryKey: CHAVE_SESSAO,
    queryFn: buscarMeusDados,
    enabled: marcador === true,
    staleTime: 5 * 60_000,
    // Bootstrap bloqueia o painel: 1 retentativa rápida e 4xx nunca repete (CC-58 do blueprint).
    retry: (falhas, erro) => {
      const status = (erro as { response?: { status?: number } })?.response?.status;
      return !(status && status < 500) && falhas < 1;
    },
    retryDelay: 400,
  });

  const login = useCallback(
    async (payload: LoginPayload): Promise<UsuarioSessao> => {
      const usuario = await criarSessao(payload);
      queryClient.clear();
      if (usuario.expiraEm) gravarMarcadorSessao(usuario.expiraEm);
      queryClient.setQueryData(CHAVE_SESSAO, usuario);
      return usuario;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await excluirSessao();
    } finally {
      // No finally: com a API fora do ar é justamente quando o logout precisa limpar o local.
      limparMarcadorSessao();
      window.location.href = "/login";
    }
  }, []);

  const usuario = marcador ? (sessao.data ?? null) : null;
  const hasPermission = useCallback(
    (permissao: Permissao) => Boolean(usuario?.permissoes.includes(permissao)),
    [usuario],
  );

  return {
    usuario,
    loading: marcador === null || (marcador === true && sessao.isPending),
    erroSessao: sessao.isError,
    login,
    logout,
    hasPermission,
  };
}

/** Destino inicial por perfil: permissão, não nome de perfil (blueprint regra 3). */
export function rotaInicial(usuario: UsuarioSessao): string {
  return usuario.permissoes.includes("CORE_RESTAURANTE_VISUALIZAR_TODOS") ? "/plataforma" : "/painel";
}
