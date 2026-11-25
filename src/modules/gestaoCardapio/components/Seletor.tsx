/**
 * @description Lista de escolha única do painel, com teclado (setas, Home, End, Enter, Esc).
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";

export type Opcao<T> = { id: T; nome: string };

type SeletorProps<T> = {
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (id: T) => void;
  className?: string;
};

/** Lista própria em vez de `<select>`: o popup nativo ignora o tema escuro e abre branco no Windows. */
export function Seletor<T extends string | null>({ rotulo, opcoes, valor, onChange, className = "sm:w-64" }: SeletorProps<T>) {
  const id = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const selecionado = Math.max(0, opcoes.findIndex((opcao) => opcao.id === valor));

  useEffect(() => {
    if (aberto) listaRef.current?.focus();
  }, [aberto]);
  useEffect(() => {
    if (aberto) document.getElementById(`${id}-${ativo}`)?.scrollIntoView({ block: "nearest" });
  }, [aberto, ativo, id]);

  const abrir = () => {
    setAtivo(selecionado);
    setAberto(true);
  };
  const fechar = () => {
    setAberto(false);
    botaoRef.current?.focus();
  };
  const escolher = (indice: number) => {
    onChange(opcoes[indice].id);
    fechar();
  };

  const teclar = (evento: KeyboardEvent<HTMLUListElement>) => {
    const ultimo = opcoes.length - 1;
    const destino: Record<string, number> = { ArrowDown: Math.min(ativo + 1, ultimo), ArrowUp: Math.max(ativo - 1, 0), Home: 0, End: ultimo };
    if (evento.key in destino) setAtivo(destino[evento.key]);
    else if (evento.key === "Enter" || evento.key === " ") escolher(ativo);
    else if (evento.key === "Escape") fechar();
    else return;
    evento.preventDefault();
  };

  return (
    // Fecha ao sair com Tab ou clicar fora (o foco vai para fora do contêiner).
    <div className={`relative ${className}`} onBlur={(evento) => !evento.currentTarget.contains(evento.relatedTarget) && setAberto(false)}>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={(evento) => {
          if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
          evento.preventDefault();
          abrir();
        }}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-label={`${rotulo}: ${opcoes[selecionado]?.nome ?? ""}`}
        className="flex w-full items-center justify-between gap-2 rounded-full bg-(--bg-elevado) px-4 py-2 text-sm ring-1 ring-(--borda) transition outline-none hover:bg-(--superficie-forte) focus-visible:ring-2 focus-visible:ring-(--destaque)/70"
      >
        <span className="truncate">{opcoes[selecionado]?.nome}</span>
        <CaretDownIcon aria-hidden className={`shrink-0 text-(--texto-suave) transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.ul
            ref={listaRef}
            id={`${id}-lista`}
            role="listbox"
            tabIndex={-1}
            aria-label={rotulo}
            aria-activedescendant={`${id}-${ativo}`}
            onKeyDown={teclar}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 border border-(--borda) bg-(--bg-elevado) z-20 mt-2 max-h-80 origin-top overflow-y-auto rounded-2xl p-1.5 shadow-[0_20px_50px_-12px_var(--sombra)] outline-none"
          >
            {opcoes.map((opcao, indice) => (
              <li
                key={opcao.id ?? ""}
                id={`${id}-${indice}`}
                role="option"
                aria-selected={indice === selecionado}
                onClick={() => escolher(indice)}
                onMouseMove={() => setAtivo(indice)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${indice === ativo ? "bg-(--superficie-forte)" : ""} ${indice === selecionado ? "text-(--principal-forte)" : indice === ativo ? "text-(--texto)" : "text-(--texto-suave)"}`}
              >
                <span className="truncate">{opcao.nome}</span>
                {indice === selecionado && <CheckIcon weight="bold" aria-hidden className="shrink-0" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
