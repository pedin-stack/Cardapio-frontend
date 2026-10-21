/**
 * @description Cor de destaque do cardápio: seletor nativo + hex digitável + voltar ao padrão, com prévia de como
 * o preço e o coração ficam no cardápio. `null` = cor padrão.
 */
import { useEffect, useId, useState } from "react";
import { ArrowCounterClockwiseIcon, HeartIcon } from "@phosphor-icons/react";

import { COR_PADRAO, COR_REGEX, corDoTextoSobre } from "@/utils/cor";

import { CLASSE_CAMPO } from "./InputField";

type CampoCorProps = {
  cor: string | null;
  onChange: (cor: string | null) => void;
  erro?: string;
};

export function CampoCor({ cor, onChange, erro }: CampoCorProps) {
  const id = useId();
  const efetiva = cor ?? COR_PADRAO;
  // O texto pode ficar incompleto enquanto a pessoa digita; só vira cor quando é um hex válido.
  const [texto, setTexto] = useState(efetiva);
  useEffect(() => setTexto(efetiva), [efetiva]);

  const digitar = (valor: string) => {
    const normalizado = valor.startsWith("#") ? valor : `#${valor}`;
    setTexto(normalizado);
    if (COR_REGEX.test(normalizado)) onChange(normalizado.toLowerCase());
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-(--texto-suave)">
        Cor do cardápio
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={efetiva}
          onChange={(evento) => onChange(evento.target.value.toLowerCase())}
          aria-label="Escolher cor"
          className="size-12 shrink-0 cursor-pointer rounded-2xl bg-transparent ring-1 ring-(--borda-forte) [&::-moz-color-swatch]:rounded-xl [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-xl [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-1"
        />
        <input
          id={id}
          value={texto}
          onChange={(evento) => digitar(evento.target.value.trim())}
          onBlur={() => setTexto(efetiva)}
          maxLength={7}
          spellCheck={false}
          autoCapitalize="off"
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={`${CLASSE_CAMPO} w-32 font-mono uppercase`}
        />
        {cor && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-(--texto-suave) ring-1 ring-(--borda-forte) transition hover:text-(--texto)"
          >
            <ArrowCounterClockwiseIcon size={14} aria-hidden />
            Padrão
          </button>
        )}
      </div>

      {/* Prévia: as mesmas peças do cardápio (escuro), na cor escolhida. */}
      <div className="mt-1 flex items-center gap-3 rounded-2xl bg-[#0a1519] px-4 py-3 ring-1 ring-(--borda)" aria-hidden>
        <span
          className="rounded-full px-4 py-1.5 text-sm font-semibold"
          style={{
            backgroundImage: `linear-gradient(135deg, ${efetiva}, color-mix(in oklab, ${efetiva} 62%, white))`,
            color: corDoTextoSobre(efetiva),
          }}
        >
          R$ 39,90
        </span>
        <HeartIcon size={26} weight="fill" style={{ color: efetiva }} />
        <span className="text-xs text-white/60">Prévia no cardápio</span>
      </div>

      {erro && (
        <p id={`${id}-erro`} role="alert" className="text-xs text-(--perigo)">
          {erro}
        </p>
      )}
    </div>
  );
}
