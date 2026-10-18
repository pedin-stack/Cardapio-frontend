/**
 * @description Coração de curtir com mola e explosão de partículas ao curtir.
 */
import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon } from "@phosphor-icons/react";

type BotaoCurtirProps = {
  curtido: boolean;
  onAlternar: () => void;
  tamanho?: "md" | "lg";
  className?: string;
};

const PARTICULAS = Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8);

export function BotaoCurtir({ curtido, onAlternar, tamanho = "lg", className }: BotaoCurtirProps) {
  const dimensao = tamanho === "lg" ? "size-14" : "size-11";
  const icone = tamanho === "lg" ? 30 : 24;

  return (
    <motion.button
      type="button"
      onClick={(evento) => {
        evento.stopPropagation();
        onAlternar();
      }}
      whileTap={{ scale: 0.82 }}
      aria-pressed={curtido}
      aria-label={curtido ? "Remover dos curtidos" : "Curtir"}
      className={`relative grid ${dimensao} place-items-center rounded-full vidro-claro ${className ?? ""}`}
    >
      <motion.span
        key={curtido ? "on" : "off"}
        initial={{ scale: curtido ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
        className={curtido ? "text-(--destaque) drop-shadow-[0_0_12px_color-mix(in_srgb,var(--destaque)_70%,transparent)]" : "text-white"}
      >
        <HeartIcon size={icone} weight={curtido ? "fill" : "bold"} aria-hidden />
      </motion.span>

      <AnimatePresence>
        {curtido &&
          PARTICULAS.map((angulo) => (
            <motion.span
              key={angulo}
              aria-hidden
              className="pointer-events-none absolute size-1.5 rounded-full gradiente-destaque"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angulo) * 34, y: Math.sin(angulo) * 34, opacity: 0, scale: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
      </AnimatePresence>
    </motion.button>
  );
}
