/**
 * @description Botão do painel: primário (gradiente), secundário (vidro) e perigo, com estado de carregamento.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { CircleNotchIcon } from "@phosphor-icons/react";

type Variante = "primario" | "secundario" | "perigo";

const CLASSES: Record<Variante, string> = {
  primario: "gradiente-destaque text-(--sobre-destaque) sombra-destaque",
  secundario: "vidro-claro text-(--texto) hover:bg-(--superficie-max)",
  perigo: "bg-(--perigo)/15 text-(--perigo) ring-1 ring-(--perigo)/30 hover:bg-(--perigo)/25",
};

type BotaoProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variante?: Variante;
  loading?: boolean;
  icone?: ReactNode;
  children: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export function Botao({ variante = "primario", loading, icone, children, className, disabled, type = "button", ...props }: BotaoProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${CLASSES[variante]} ${className ?? ""}`}
      {...props}
    >
      {loading ? <CircleNotchIcon size={18} className="animate-spin" aria-hidden /> : icone}
      {children}
    </motion.button>
  );
}
