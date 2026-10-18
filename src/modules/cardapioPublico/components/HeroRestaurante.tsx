/**
 * @description Abertura imersiva (hero image-first): capa em tela cheia com parallax ao rolar,
 * logo em vidro e entrada escalonada do nome.
 */
import type { RefObject } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { CaretDoubleDownIcon } from "@phosphor-icons/react";

import type { RestaurantePublico } from "../types/cardapioPublico";

type HeroRestauranteProps = {
  restaurante: RestaurantePublico;
  totalItens: number;
  totalCategorias: number;
  capaReserva?: string;
  container: RefObject<HTMLElement | null>;
  onComecar: () => void;
};

const entrada = {
  oculto: { opacity: 0, y: 28, filter: "blur(8px)" },
  visivel: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroRestaurante({ restaurante, totalItens, totalCategorias, capaReserva, container, onComecar }: HeroRestauranteProps) {
  const { scrollY } = useScroll({ container });
  const escala = useTransform(scrollY, [0, 600], [1.08, 1.3]);
  const deslocamento = useTransform(scrollY, [0, 600], [0, 140]);
  const opacidadeTexto = useTransform(scrollY, [0, 320], [1, 0]);
  const capa = restaurante.capaUrl ?? capaReserva;

  return (
    <section className="relative h-svh w-full shrink-0 snap-start overflow-hidden" aria-label={restaurante.nome}>
      <motion.div className="absolute inset-0" style={{ scale: escala, y: deslocamento }}>
        {capa ? (
          <Image src={capa} alt="" fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
        ) : (
          <div className="size-full bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--destaque)_55%,transparent),transparent_55%),radial-gradient(circle_at_80%_70%,color-mix(in_srgb,var(--destaque-2)_40%,transparent),transparent_50%),#0b0b10]" />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-(--bg)" />

      <motion.div
        style={{ opacity: opacidadeTexto }}
        className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[calc(env(safe-area-inset-bottom)+7.5rem)] text-center"
      >
        {restaurante.logoUrl && (
          <motion.div
            custom={0}
            variants={entrada}
            initial="oculto"
            animate="visivel"
            className="relative mb-5 size-24 overflow-hidden rounded-[1.75rem] vidro-claro p-1.5 shadow-2xl"
          >
            <div className="relative size-full overflow-hidden rounded-[1.4rem]">
              <Image src={restaurante.logoUrl} alt={`Logo de ${restaurante.nome}`} fill sizes="96px" className="object-cover" />
            </div>
          </motion.div>
        )}
        <motion.h1
          custom={1}
          variants={entrada}
          initial="oculto"
          animate="visivel"
          className="font-display text-5xl leading-[1.05] font-bold tracking-tight texto-gradiente text-balance"
        >
          {restaurante.nome}
        </motion.h1>
        {restaurante.descricao && (
          <motion.p custom={2} variants={entrada} initial="oculto" animate="visivel" className="mt-3 max-w-xs text-base text-white/75">
            {restaurante.descricao}
          </motion.p>
        )}
        <motion.div custom={3} variants={entrada} initial="oculto" animate="visivel" className="mt-6 flex gap-2 text-xs font-medium">
          <span className="rounded-full vidro-claro px-3 py-1">{totalItens} {totalItens === 1 ? "prato" : "pratos"}</span>
          {totalCategorias > 0 && (
            <span className="rounded-full vidro-claro px-3 py-1">
              {totalCategorias} {totalCategorias === 1 ? "categoria" : "categorias"}
            </span>
          )}
        </motion.div>
        <motion.button
          type="button"
          onClick={onComecar}
          custom={4}
          variants={entrada}
          initial="oculto"
          animate="visivel"
          whileTap={{ scale: 0.95 }}
          className="mt-8 flex flex-col items-center gap-1 text-sm text-white/70"
        >
          Ver cardápio
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <CaretDoubleDownIcon size={22} aria-hidden />
          </motion.span>
        </motion.button>
      </motion.div>
    </section>
  );
}
