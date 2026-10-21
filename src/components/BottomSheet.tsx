/**
 * @description Folha inferior em vidro (mobile-first): sobe com mola, fecha arrastando para baixo, no fundo
 * escurecido ou com Esc. A11y de modal: role="dialog", aria-modal, foco inicial no fechar e devolvido ao sair.
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { XIcon } from "@phosphor-icons/react";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  /** Esconde o título visualmente (continua para leitor de tela). */
  tituloOculto?: boolean;
  children: ReactNode;
};

export function BottomSheet({ isOpen, onClose, titulo, tituloOculto, children }: BottomSheetProps) {
  const tituloId = useId();
  const fechar = useRef<HTMLButtonElement>(null);
  const controles = useDragControls();

  useEffect(() => {
    if (!isOpen) return;
    const anterior = document.activeElement as HTMLElement | null;
    fechar.current?.focus();
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      anterior?.focus?.();
    };
  }, [isOpen, onClose]);

  const aoSoltar = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="relative flex max-h-[92svh] w-full max-w-[480px] flex-col rounded-t-[2rem] vidro bg-(--bg-elevado)/80 shadow-[0_-20px_80px_-20px_var(--sombra)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            // Arrasto só pela alça/cabeçalho: no corpo o gesto vertical é rolagem e o horizontal é o carrossel.
            drag="y"
            dragControls={controles}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={aoSoltar}
          >
            <div
              onPointerDown={(evento) => controles.start(evento)}
              className="flex shrink-0 cursor-grab touch-none items-center justify-between px-5 pt-3 pb-2 active:cursor-grabbing"
            >
              <span className="absolute top-2.5 left-1/2 h-1.5 w-11 -translate-x-1/2 rounded-full bg-(--borda-forte)" aria-hidden />
              <h2 id={tituloId} className={tituloOculto ? "sr-only" : "mt-3 font-display text-lg font-semibold"}>
                {titulo}
              </h2>
              <button
                ref={fechar}
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="mt-3 ml-auto grid size-9 place-items-center rounded-full bg-(--superficie-forte) transition hover:bg-(--superficie-max)"
              >
                <XIcon size={18} weight="bold" aria-hidden />
              </button>
            </div>
            <div className="sem-scrollbar overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
