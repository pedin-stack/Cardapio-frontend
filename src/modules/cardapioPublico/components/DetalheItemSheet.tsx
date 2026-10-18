/**
 * @description Detalhe do prato: galeria, descrição completa, especificações (uma opção por grupo), ingredientes e curtir.
 */
import { motion } from "framer-motion";

import { BottomSheet } from "@/components/BottomSheet";
import { formatarMoeda } from "@/utils/formatarMoeda";

import { BotaoCurtir } from "./BotaoCurtir";
import { CarrosselMidia } from "./CarrosselMidia";
import type { ItemPublico } from "../types/cardapioPublico";

type DetalheItemSheetProps = {
  item: ItemPublico | null;
  curtido: boolean;
  nomesCategorias: string[];
  mudo: boolean;
  /** Grupo → opção escolhida (vai para a aba Curtidos). */
  escolhas: Record<string, string>;
  onEscolher: (grupo: string, opcao: string) => void;
  onAlternarCurtida: () => void;
  onClose: () => void;
};

const aparecer = {
  oculto: { opacity: 0, y: 16 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function DetalheItemSheet({ item, curtido, nomesCategorias, mudo, escolhas, onEscolher, onAlternarCurtida, onClose }: DetalheItemSheetProps) {
  return (
    <BottomSheet isOpen={Boolean(item)} onClose={onClose} titulo={item?.nome ?? "Detalhes"} tituloOculto>
      {item && (
        <div className="flex flex-col gap-5">
          <div className="relative aspect-[4/5] w-full">
            <CarrosselMidia item={item} modoVideo="tocar" mudo={mudo} arredondado />
          </div>

          <motion.div custom={0} variants={aparecer} initial="oculto" animate="visivel" className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {nomesCategorias.length > 0 && (
                <p className="mb-1 text-xs font-medium tracking-wider text-(--destaque-2) uppercase">{nomesCategorias.join(" · ")}</p>
              )}
              <h3 className="font-display text-2xl leading-tight font-semibold break-words">{item.nome}</h3>
              <p className="mt-2 text-xl font-semibold text-(--destaque)">{formatarMoeda(item.valor)}</p>
            </div>
            <BotaoCurtir curtido={curtido} onAlternar={onAlternarCurtida} tamanho="md" className="shrink-0" />
          </motion.div>

          {item.descricao && (
            <motion.p custom={1} variants={aparecer} initial="oculto" animate="visivel" className="leading-relaxed whitespace-pre-line text-(--texto-suave)">
              {item.descricao}
            </motion.p>
          )}

          {item.especificacoes.length > 0 && (
            <motion.section custom={2} variants={aparecer} initial="oculto" animate="visivel" className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-wider text-(--texto-fraco) uppercase">Personalize</h4>
              {item.especificacoes.map((especificacao) => (
                <fieldset key={especificacao.nome} className="flex flex-col gap-2">
                  <legend className="mb-2 text-sm font-semibold">{especificacao.nome}</legend>
                  <div className="flex flex-wrap gap-2">
                    {especificacao.opcoes.map((opcao) => {
                      const marcada = escolhas[especificacao.nome] === opcao;
                      return (
                        <label
                          key={opcao}
                          className={`flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-sm ring-1 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--destaque) ${
                            marcada ? "bg-(--destaque-suave) ring-(--destaque)" : "bg-white/6 ring-white/12"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${item.id}:${especificacao.nome}`}
                            value={opcao}
                            checked={marcada}
                            onChange={() => onEscolher(especificacao.nome, opcao)}
                            className="size-4 accent-(--destaque)"
                          />
                          {opcao}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </motion.section>
          )}

          {item.ingredientes.length > 0 && (
            <motion.section custom={3} variants={aparecer} initial="oculto" animate="visivel">
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-(--texto-fraco) uppercase">Ingredientes</h4>
              <ul className="flex flex-wrap gap-2">
                {item.ingredientes.map((ingrediente, i) => (
                  <motion.li
                    key={`${ingrediente}-${i}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.03, type: "spring", stiffness: 400, damping: 24 }}
                    className="rounded-full bg-white/8 px-3 py-1 text-sm ring-1 ring-white/10"
                  >
                    {ingrediente}
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
