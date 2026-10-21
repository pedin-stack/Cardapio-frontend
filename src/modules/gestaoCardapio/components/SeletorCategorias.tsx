/**
 * @description Categorias do item (várias por item) como chips alternáveis, com criação na hora.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";

import { useCategorias } from "../hooks/useCategorias";

type SeletorCategoriasProps = {
  selecionadas: string[];
  onChange: (ids: string[]) => void;
};

export function SeletorCategorias({ selecionadas, onChange }: SeletorCategoriasProps) {
  const { categorias, criar } = useCategorias();
  const [nova, setNova] = useState("");

  const alternar = (id: string) =>
    onChange(selecionadas.includes(id) ? selecionadas.filter((outro) => outro !== id) : [...selecionadas, id]);

  const adicionar = async () => {
    const nome = nova.trim();
    if (!nome) return;
    const existente = categorias.find((c) => c.nome.toLowerCase() === nome.toLowerCase());
    if (existente) {
      if (!selecionadas.includes(existente.id)) onChange([...selecionadas, existente.id]);
      setNova("");
      return;
    }
    const criada = await criar.mutateAsync({ nome, ordem: categorias.length }).catch(() => null);
    if (criada) {
      onChange([...selecionadas, criada.id]);
      setNova("");
    }
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-(--texto-suave)">Categorias</legend>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {categorias.map((categoria) => {
            const ativa = selecionadas.includes(categoria.id);
            return (
              <motion.button
                key={categoria.id}
                layout
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => alternar(categoria.id)}
                aria-pressed={ativa}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors ${
                  ativa ? "bg-(--destaque-suave) text-(--texto) ring-(--destaque)/60" : "bg-(--superficie) text-(--texto-suave) ring-(--borda)"
                }`}
              >
                <AnimatePresence initial={false}>
                  {ativa && (
                    <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }}>
                      <CheckIcon size={14} weight="bold" aria-hidden />
                    </motion.span>
                  )}
                </AnimatePresence>
                {categoria.nome}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <input
          value={nova}
          onChange={(evento) => setNova(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              adicionar();
            }
          }}
          maxLength={60}
          placeholder="Nova categoria (ex.: Cafés)"
          aria-label="Nova categoria"
          className="min-w-0 flex-1 rounded-full bg-(--superficie) px-4 py-2 text-sm ring-1 ring-(--borda) outline-none focus:ring-2 focus:ring-(--destaque)/70"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={adicionar}
          disabled={!nova.trim() || criar.isPending}
          aria-label="Criar categoria"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-(--superficie-forte) transition hover:bg-(--superficie-max) disabled:opacity-40"
        >
          <PlusIcon size={18} weight="bold" aria-hidden />
        </motion.button>
      </div>
    </fieldset>
  );
}
