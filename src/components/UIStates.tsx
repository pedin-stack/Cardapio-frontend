/**
 * @description Estados de tela padronizados: carregando, erro (com saída explícita) e vazio.
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { WarningCircleIcon } from "@phosphor-icons/react";

export function LoadingState({ rotulo = "Carregando…" }: { rotulo?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-4 py-24 text-(--texto-suave)">
      <span className="relative flex size-10">
        <span className="absolute inset-0 animate-ping rounded-full bg-(--destaque)/30" />
        <span className="relative size-10 rounded-full gradiente-destaque" />
      </span>
      <span className="text-sm">{rotulo}</span>
    </div>
  );
}

type ErrorStateProps = {
  mensagem: string;
  onRetry?: () => void;
};

export function ErrorState({ mensagem, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-20 text-center"
    >
      <WarningCircleIcon size={40} weight="duotone" className="text-(--perigo)" aria-hidden />
      <p className="text-(--texto-suave)">{mensagem}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full vidro-claro px-5 py-2 text-sm font-medium transition hover:bg-white/15 active:scale-95"
        >
          Tentar de novo
        </button>
      )}
    </motion.div>
  );
}

type EmptyStateProps = {
  titulo: string;
  descricao?: string;
  icone?: ReactNode;
  acao?: ReactNode;
};

export function EmptyState({ titulo, descricao, icone, acao }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-20 text-center"
    >
      {icone && <div className="mb-2 text-(--texto-fraco)">{icone}</div>}
      <h2 className="font-display text-lg font-semibold">{titulo}</h2>
      {descricao && <p className="text-sm text-(--texto-suave)">{descricao}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </motion.div>
  );
}
