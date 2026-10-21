/**
 * @description Especificações do item: grupos de opção única que o cliente escolhe no cardápio
 * (ex.: "Ponto da carne": mal passado / ao ponto / bem passado). As opções usam as mesmas etiquetas dos ingredientes.
 */
import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { InputField } from "@/components/inputs/InputField";

import { CampoIngredientes } from "./CampoIngredientes";
import { MAXIMO_ESPECIFICACOES } from "../schemas/itemCardapio.schema";
import type { Especificacao } from "../types/gestaoCardapio";

type CampoEspecificacoesProps = {
  especificacoes: Especificacao[];
  onChange: (especificacoes: Especificacao[]) => void;
  /** Erros por grupo (mesmo índice) e da lista inteira. */
  erros?: { nome?: string; opcoes?: string }[];
  erro?: string;
};

export function CampoEspecificacoes({ especificacoes, onChange, erros, erro }: CampoEspecificacoesProps) {
  const alterar = (indice: number, parcial: Partial<Especificacao>) =>
    onChange(especificacoes.map((especificacao, i) => (i === indice ? { ...especificacao, ...parcial } : especificacao)));

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-(--texto-suave)">Especificações</p>
        <p className="text-xs text-(--texto-fraco)">O cliente escolhe uma opção de cada (ex.: ponto da carne, com ou sem açúcar).</p>
      </div>

      <AnimatePresence initial={false}>
        {especificacoes.map((especificacao, indice) => (
          <motion.div
            // ponytail: chave por índice (o grupo não tem id); remover um grupo do meio reaproveita o texto digitado.
            key={indice}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col gap-3 rounded-2xl bg-(--superficie) p-3 ring-1 ring-(--borda)"
          >
            <div className="flex items-end gap-2">
              <InputField
                label="Nome"
                placeholder="Ex.: Ponto da carne"
                value={especificacao.nome}
                maxLength={60}
                onChange={(evento) => alterar(indice, { nome: evento.target.value })}
                erro={erros?.[indice]?.nome}
                wrapperClassName="flex-1"
              />
              <button
                type="button"
                onClick={() => onChange(especificacoes.filter((_, i) => i !== indice))}
                aria-label={`Remover a especificação ${especificacao.nome || indice + 1}`}
                className="mb-1 grid size-10 shrink-0 place-items-center rounded-full text-(--perigo) hover:bg-(--perigo)/12"
              >
                <TrashIcon size={18} aria-hidden />
              </button>
            </div>
            <CampoIngredientes
              rotulo="Opções"
              ingredientes={especificacao.opcoes}
              onChange={(opcoes) => alterar(indice, { opcoes })}
              limite={10}
              tamanhoMaximo={60}
              erro={erros?.[indice]?.opcoes}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {especificacoes.length < MAXIMO_ESPECIFICACOES && (
        <button
          type="button"
          onClick={() => onChange([...especificacoes, { nome: "", opcoes: [] }])}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-(--borda-forte) py-3 text-sm font-medium text-(--texto-suave) transition hover:border-(--principal) hover:text-(--texto)"
        >
          <PlusIcon size={16} weight="bold" aria-hidden />
          Adicionar especificação
        </button>
      )}
      {erro && (
        <p role="alert" className="text-xs text-(--perigo)">
          {erro}
        </p>
      )}
    </div>
  );
}
