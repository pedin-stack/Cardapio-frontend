/**
 * @description Casca dos painéis (gestor e plataforma), mobile-first: cabeçalho de vidro com saída e
 * barra de abas inferior com indicador deslizante. Promovido para `components` porque dois módulos usam.
 */
import type { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { SignOutIcon, type Icon } from "@phosphor-icons/react";

import { useAuth } from "@/auth/useAuth";

export type AbaPainel = {
  href: string;
  rotulo: string;
  Icone: Icon;
};

type PainelShellProps = {
  titulo: string;
  subtitulo?: string;
  abas: AbaPainel[];
  acoes?: ReactNode;
  children: ReactNode;
};

export function PainelShell({ titulo, subtitulo, abas, acoes, children }: PainelShellProps) {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const abaAtiva = abas
    .filter((aba) => router.pathname === aba.href || router.pathname.startsWith(`${aba.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_80%_-10%,rgba(255,107,74,0.14),transparent_45%)]">
      <Head>
        <title>{`${titulo} · Painel`}</title>
      </Head>

      <header className="sticky top-0 z-30 border-b border-white/5 bg-(--bg)/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-(--texto-fraco)">{usuario?.restauranteNome ?? "Plataforma"}</p>
            <h1 className="truncate font-display text-xl font-semibold">{titulo}</h1>
          </div>
          {acoes}
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/8 ring-1 ring-white/10 transition hover:bg-white/15"
          >
            <SignOutIcon size={18} weight="bold" aria-hidden />
          </button>
        </div>
      </header>

      <motion.main
        key={router.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl px-4 pt-5 pb-36"
      >
        {subtitulo && <p className="mb-5 text-sm text-(--texto-suave)">{subtitulo}</p>}
        {children}
      </motion.main>

      {abas.length > 1 && (
        <nav
          aria-label="Seções do painel"
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 mx-auto flex w-[calc(100%-2rem)] max-w-md gap-1 rounded-full vidro p-1.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
        >
          {abas.map((aba) => {
            const ativa = aba === abaAtiva;
            return (
              <Link
                key={aba.href}
                href={aba.href}
                aria-current={ativa ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-colors ${ativa ? "text-white" : "text-white/55"}`}
              >
                {ativa && (
                  <motion.span
                    layoutId="painel-aba"
                    className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <aba.Icone size={20} weight={ativa ? "fill" : "regular"} className="relative" aria-hidden />
                <span className="relative">{aba.rotulo}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
