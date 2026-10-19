/**
 * @description Cabeçalho fixo do cardápio: logo horizontal do restaurante (sem ela, o nome), alternador feed/lista e
 * as redes sociais (WhatsApp e Instagram) que o gestor preencheu.
 */
import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FilmStripIcon, InstagramLogoIcon, ListBulletsIcon, WhatsappLogoIcon } from "@phosphor-icons/react";

import type { RestaurantePublico } from "../types/cardapioPublico";

export type ModoCardapio = "feed" | "lista";

type CabecalhoCardapioProps = {
  restaurante: RestaurantePublico;
  modo: ModoCardapio;
  onAlternarModo: () => void;
};

const CLASSE_BOTAO = "grid size-10 shrink-0 place-items-center rounded-full vidro-claro";

export function CabecalhoCardapio({ restaurante, modo, onAlternarModo }: CabecalhoCardapioProps) {
  return (
    <header className="pointer-events-auto flex items-center gap-2 bg-gradient-to-b from-black/70 via-black/35 to-transparent px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3">
      <div className="relative h-10 min-w-0 flex-1">
        {restaurante.logoCabecalhoUrl ? (
          <Image
            src={restaurante.logoCabecalhoUrl}
            alt={restaurante.nome}
            fill
            priority
            sizes="240px"
            className="object-contain object-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          />
        ) : (
          <span className="block truncate font-display text-lg leading-10 font-semibold drop-shadow-lg">{restaurante.nome}</span>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={onAlternarModo}
        aria-label={modo === "feed" ? "Ver em lista" : "Ver em vídeos"}
        className={CLASSE_BOTAO}
      >
        {modo === "feed" ? <ListBulletsIcon size={20} weight="bold" aria-hidden /> : <FilmStripIcon size={20} weight="bold" aria-hidden />}
      </motion.button>
      {restaurante.whatsapp && (
        <LinkRede href={`https://wa.me/55${restaurante.whatsapp}`} rotulo="WhatsApp do restaurante">
          <WhatsappLogoIcon size={21} weight="fill" aria-hidden />
        </LinkRede>
      )}
      {restaurante.instagram && (
        <LinkRede href={`https://instagram.com/${restaurante.instagram}`} rotulo="Instagram do restaurante">
          <InstagramLogoIcon size={21} weight="bold" aria-hidden />
        </LinkRede>
      )}
    </header>
  );
}

function LinkRede({ href, rotulo, children }: { href: string; rotulo: string; children: ReactNode }) {
  return (
    <motion.a whileTap={{ scale: 0.85 }} href={href} target="_blank" rel="noreferrer" aria-label={rotulo} className={CLASSE_BOTAO}>
      {children}
    </motion.a>
  );
}
