/**
 * @description Tela 404 personalizada: restaurante desativado/inexistente ou rota que não existe.
 */
import { motion } from "framer-motion";
import { StorefrontIcon } from "@phosphor-icons/react";

const BOLHAS = [
  { cor: "color-mix(in srgb, var(--mc-laranja) 45%, transparent)", tamanho: 320, x: "-30%", y: "-20%", duracao: 14 },
  { cor: "color-mix(in srgb, var(--mc-turquesa) 40%, transparent)", tamanho: 260, x: "40%", y: "30%", duracao: 18 },
  { cor: "color-mix(in srgb, var(--mc-menta) 35%, transparent)", tamanho: 220, x: "-10%", y: "55%", duracao: 16 },
];

type ServicoIndisponivelProps = {
  titulo?: string;
  descricao?: string;
};

export function ServicoIndisponivel({
  titulo = "Serviço indisponível",
  descricao = "Este cardápio não está disponível no momento. Tente novamente mais tarde.",
}: ServicoIndisponivelProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-(--bg) px-6">
      {BOLHAS.map((bolha) => (
        <motion.span
          key={bolha.cor}
          aria-hidden
          className="absolute rounded-full blur-3xl"
          style={{ width: bolha.tamanho, height: bolha.tamanho, background: bolha.cor, left: "50%", top: "40%" }}
          initial={{ x: bolha.x, y: bolha.y }}
          animate={{ x: [bolha.x, "0%", bolha.x], y: [bolha.y, "10%", bolha.y], scale: [1, 1.15, 1] }}
          transition={{ duration: bolha.duracao, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-[2rem] vidro p-8 text-center shadow-2xl"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.05em" }}
          transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-8xl font-bold texto-gradiente"
          aria-hidden
        >
          404
        </motion.p>
        <motion.div
          initial={{ rotate: -12, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 14 }}
          className="mx-auto mt-4 grid size-14 place-items-center rounded-2xl vidro-claro"
        >
          <StorefrontIcon size={28} weight="duotone" className="text-(--principal-forte)" aria-hidden />
        </motion.div>
        <h1 className="mt-5 font-display text-2xl font-semibold">{titulo}</h1>
        <p className="mt-2 text-sm text-(--texto-suave)">{descricao}</p>
      </motion.div>
    </main>
  );
}
