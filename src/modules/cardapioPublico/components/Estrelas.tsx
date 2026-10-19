/**
 * @description Estrelas do prato: a média ("★ 4,6 (23)", só leitura) e a escolha de 1 a 5 do cliente (radiogroup).
 */
import { motion } from "framer-motion";
import { StarIcon } from "@phosphor-icons/react";

const umaCasa = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function MediaEstrelas({ media, total, className }: { media?: number; total: number; className?: string }) {
  if (!media || total === 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold ${className ?? ""}`}
      aria-label={`Nota ${umaCasa(media)} de 5, ${total} ${total === 1 ? "avaliação" : "avaliações"}`}
    >
      <StarIcon size={14} weight="fill" className="text-(--aviso)" aria-hidden />
      {umaCasa(media)}
      <span className="font-normal text-white/60">({total})</span>
    </span>
  );
}

export function EscolhaEstrelas({ valor, onEscolher }: { valor: number; onEscolher: (estrelas: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Sua avaliação" className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
          whileTap={{ scale: 0.75 }}
          onClick={() => onEscolher(n)}
          className="grid size-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-(--destaque)"
        >
          <StarIcon size={28} weight={n <= valor ? "fill" : "regular"} className={n <= valor ? "text-(--aviso)" : "text-white/40"} aria-hidden />
        </motion.button>
      ))}
    </div>
  );
}
