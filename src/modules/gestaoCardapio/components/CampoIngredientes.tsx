/**
 * @description Ingredientes como etiquetas: Enter ou vírgula adiciona; Backspace no campo vazio remove o último.
 */
import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "@phosphor-icons/react";

import { CLASSE_CAMPO } from "@/components/inputs/InputField";

type CampoIngredientesProps = {
  ingredientes: string[];
  onChange: (ingredientes: string[]) => void;
  erro?: string;
};

export function CampoIngredientes({ ingredientes, onChange, erro }: CampoIngredientesProps) {
  const id = useId();
  const [texto, setTexto] = useState("");

  const adicionar = () => {
    const novos = texto
      .split(",")
      .map((parte) => parte.trim())
      .filter((parte) => parte && !ingredientes.some((i) => i.toLowerCase() === parte.toLowerCase()));
    if (novos.length > 0) onChange([...ingredientes, ...novos].slice(0, 40));
    setTexto("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-(--texto-suave)">
        Ingredientes
      </label>
      <div className={`${CLASSE_CAMPO} flex flex-wrap items-center gap-1.5 px-2.5 py-2 focus-within:ring-2 focus-within:ring-(--destaque)/70`}>
        <AnimatePresence initial={false}>
          {ingredientes.map((ingrediente) => (
            <motion.span
              key={ingrediente}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pr-1 pl-3 text-sm"
            >
              {ingrediente}
              <button
                type="button"
                onClick={() => onChange(ingredientes.filter((outro) => outro !== ingrediente))}
                aria-label={`Remover ${ingrediente}`}
                className="grid size-5 place-items-center rounded-full hover:bg-white/15"
              >
                <XIcon size={11} weight="bold" aria-hidden />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          id={id}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter" || evento.key === ",") {
              evento.preventDefault();
              adicionar();
            } else if (evento.key === "Backspace" && !texto && ingredientes.length > 0) {
              onChange(ingredientes.slice(0, -1));
            }
          }}
          onBlur={adicionar}
          maxLength={80}
          placeholder={ingredientes.length === 0 ? "Digite e tecle Enter" : ""}
          aria-invalid={Boolean(erro)}
          className="min-w-24 flex-1 bg-transparent px-1.5 py-1 text-[15px] outline-none placeholder:text-(--texto-fraco)"
        />
      </div>
      {erro && (
        <p role="alert" className="text-xs text-(--perigo)">
          {erro}
        </p>
      )}
    </div>
  );
}
