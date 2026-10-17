/**
 * @description Situação do vídeo do item (o PROCESSANDO pulsa enquanto o FFmpeg trabalha).
 */
import { CheckCircleIcon, CircleNotchIcon, VideoCameraIcon, WarningIcon } from "@phosphor-icons/react";

import type { StatusVideo } from "../types/gestaoCardapio";

const CONFIG: Record<Exclude<StatusVideo, "SEM_VIDEO">, { rotulo: string; classe: string; Icone: typeof VideoCameraIcon }> = {
  PROCESSANDO: { rotulo: "Processando vídeo", classe: "bg-(--aviso)/15 text-(--aviso)", Icone: CircleNotchIcon },
  PRONTO: { rotulo: "Vídeo pronto", classe: "bg-(--sucesso)/15 text-(--sucesso)", Icone: CheckCircleIcon },
  ERRO: { rotulo: "Falha no vídeo", classe: "bg-(--perigo)/15 text-(--perigo)", Icone: WarningIcon },
};

export function StatusVideoBadge({ status }: { status: StatusVideo }) {
  if (status === "SEM_VIDEO") return null;
  const { rotulo, classe, Icone } = CONFIG[status];
  return (
    <span role="status" className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${classe}`}>
      <Icone size={12} weight="bold" className={status === "PROCESSANDO" ? "animate-spin" : undefined} aria-hidden />
      {rotulo}
    </span>
  );
}
