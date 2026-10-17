/**
 * @description Barra inferior em vidro: Cardápio | Curtidos (com contador que "pula" a cada curtida).
 */
import { AnimatePresence, motion } from "framer-motion";
import { ForkKnifeIcon, HeartIcon } from "@phosphor-icons/react";

export type Aba = "cardapio" | "curtidos";

type BarraNavegacaoProps = {
  aba: Aba;
  totalCurtidos: number;
  onTrocar: (aba: Aba) => void;
};

export function BarraNavegacao({ aba, totalCurtidos, onTrocar }: BarraNavegacaoProps) {
  const abas = [
    { id: "cardapio" as const, rotulo: "Cardápio", Icone: ForkKnifeIcon },
    { id: "curtidos" as const, rotulo: "Curtidos", Icone: HeartIcon },
  ];

  return (
    <motion.nav
      aria-label="Navegação do cardápio"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 mx-auto flex w-[calc(100%-2rem)] max-w-[22rem] gap-1 rounded-full vidro p-1.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
    >
      {abas.map(({ id, rotulo, Icone }) => {
        const ativa = aba === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTrocar(id)}
            aria-current={ativa ? "page" : undefined}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors ${ativa ? "text-white" : "text-white/60"}`}
          >
            {ativa && (
              <motion.span
                layoutId="aba-ativa"
                className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <Icone size={20} weight={ativa ? "fill" : "regular"} className="relative" aria-hidden />
            <span className="relative">{rotulo}</span>
            {id === "curtidos" && totalCurtidos > 0 && (
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={totalCurtidos}
                  initial={{ scale: 0.2, y: -8 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 15 }}
                  className="relative grid min-w-5 place-items-center rounded-full gradiente-destaque px-1.5 text-[11px] leading-5 font-bold text-white"
                  aria-label={`${totalCurtidos} curtidos`}
                >
                  {totalCurtidos}
                </motion.span>
              </AnimatePresence>
            )}
          </button>
        );
      })}
    </motion.nav>
  );
}
