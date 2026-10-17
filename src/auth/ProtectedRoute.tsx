/**
 * @description Guard das telas do painel. A permissão é a string EXATA do @PreAuthorize do controller.
 * Sem sessão → login (com volta à rota); logado sem permissão → tela de acesso negado (sem redirect automático).
 */
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { LockKeyIcon } from "@phosphor-icons/react";

import { useAuth } from "@/auth/useAuth";
import { EmptyState, ErrorState, LoadingState } from "@/components/UIStates";
import type { Permissao } from "@/types/permissoes";

type ProtectedRouteProps = {
  permissao: Permissao;
  children: ReactNode;
};

export function ProtectedRoute({ permissao, children }: ProtectedRouteProps) {
  const router = useRouter();
  const { usuario, loading, erroSessao, hasPermission } = useAuth();
  const deslogado = !loading && !usuario && !erroSessao;

  useEffect(() => {
    if (deslogado) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [deslogado, router]);

  if (erroSessao) {
    return <ErrorState mensagem="Não foi possível carregar sua sessão." onRetry={() => router.reload()} />;
  }
  if (loading || !usuario) return <LoadingState />;
  if (!hasPermission(permissao)) {
    return (
      <EmptyState
        icone={<LockKeyIcon size={44} weight="duotone" aria-hidden />}
        titulo="Acesso negado"
        descricao="Seu perfil não tem permissão para esta área."
        acao={
          <Link href="/login" className="rounded-full vidro-claro px-5 py-2 text-sm font-medium">
            Entrar com outra conta
          </Link>
        }
      />
    );
  }
  return <>{children}</>;
}
