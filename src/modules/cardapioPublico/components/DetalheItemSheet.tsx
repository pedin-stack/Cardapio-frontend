/**
 * @description Detalhe do prato: galeria, estrelas, descrição completa, especificações (uma opção por grupo),
 * adicionais pagos (somam no preço), ingredientes, a avaliação do cliente, comentários, compartilhar e curtir.
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ShareFatIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro, statusDoErro } from "@/api/mensagemErro";
import { BottomSheet } from "@/components/BottomSheet";
import { formatarMoeda } from "@/utils/formatarMoeda";

import { BotaoCurtir } from "./BotaoCurtir";
import { CarrosselMidia } from "./CarrosselMidia";
import { EscolhaEstrelas, MediaEstrelas } from "./Estrelas";
import { SecaoComentarios } from "./SecaoComentarios";
import type { ClienteCardapio } from "../hooks/useCliente";
import { precoUnitario } from "../hooks/useCurtidos";
import { avaliarItem } from "../services/cardapioPublicoService";
import type { ItemPublico } from "../types/cardapioPublico";

type DetalheItemSheetProps = {
  item: ItemPublico | null;
  slug: string;
  curtido: boolean;
  nomesCategorias: string[];
  mudo: boolean;
  /** Grupo → opção escolhida (vai para a aba Curtidos). */
  escolhas: Record<string, string>;
  onEscolher: (grupo: string, opcao: string) => void;
  /** Adicionais marcados (vão para a aba Curtidos e somam no preço). */
  adicionais: string[];
  onAlternarAdicional: (adicionalId: string) => void;
  cliente: ClienteCardapio;
  /** Aberto pelo botão de comentar do feed: rola até os comentários. */
  focarComentarios: boolean;
  onAlternarCurtida: () => void;
  onCompartilhar: () => void;
  onClose: () => void;
};

const aparecer = {
  oculto: { opacity: 0, y: 16 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

const CLASSE_TITULO = "text-xs font-semibold tracking-wider text-(--texto-fraco) uppercase";

export function DetalheItemSheet({
  item,
  slug,
  curtido,
  nomesCategorias,
  mudo,
  escolhas,
  onEscolher,
  adicionais,
  onAlternarAdicional,
  cliente,
  focarComentarios,
  onAlternarCurtida,
  onCompartilhar,
  onClose,
}: DetalheItemSheetProps) {
  const queryClient = useQueryClient();
  const secaoComentarios = useRef<HTMLElement>(null);

  // Espera a folha subir antes de rolar até os comentários (só ao abrir: o item recarregado não rola de novo).
  const itemId = item?.id;
  useEffect(() => {
    if (!itemId || !focarComentarios) return;
    const espera = setTimeout(() => secaoComentarios.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
    return () => clearTimeout(espera);
  }, [itemId, focarComentarios]);

  const avaliar = (estrelas: number) => {
    if (!item) return;
    const itemId = item.id;
    const enviar = async (token: string) => {
      const anterior = cliente.minhaAvaliacao(itemId);
      cliente.lembrarAvaliacao(itemId, estrelas);
      try {
        await avaliarItem(slug, itemId, estrelas, token);
        // A média do card vem no cardápio.
        queryClient.invalidateQueries({ queryKey: ["cardapio-publico", slug] });
      } catch (erro) {
        cliente.lembrarAvaliacao(itemId, anterior);
        if (statusDoErro(erro) === 401) cliente.esquecer(enviar);
        else toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar sua avaliação."));
      }
    };
    cliente.exigir(enviar);
  };

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
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-xl font-semibold text-white">{formatarMoeda(precoUnitario(item, adicionais))}</p>
                <MediaEstrelas media={item.avaliacaoMedia} total={item.avaliacoes} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={onCompartilhar}
                aria-label={`Compartilhar ${item.nome}`}
                className="grid size-11 place-items-center rounded-full vidro-claro"
              >
                <ShareFatIcon size={22} weight="bold" aria-hidden />
              </motion.button>
              <BotaoCurtir curtido={curtido} onAlternar={onAlternarCurtida} tamanho="md" />
            </div>
          </motion.div>

          {item.descricao && (
            <motion.p custom={1} variants={aparecer} initial="oculto" animate="visivel" className="leading-relaxed whitespace-pre-line text-(--texto-suave)">
              {item.descricao}
            </motion.p>
          )}

          {item.especificacoes.length > 0 && (
            <motion.section custom={2} variants={aparecer} initial="oculto" animate="visivel" className="flex flex-col gap-4">
              <h4 className={CLASSE_TITULO}>Personalize</h4>
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

          {item.adicionais.length > 0 && (
            <motion.fieldset custom={3} variants={aparecer} initial="oculto" animate="visivel" className="flex flex-col gap-2">
              <legend className={`mb-2 ${CLASSE_TITULO}`}>Adicionais</legend>
              {item.adicionais.map((adicional) => {
                const marcado = adicionais.includes(adicional.id);
                return (
                  <label
                    key={adicional.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm ring-1 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--destaque) ${
                      marcado ? "bg-(--destaque-suave) ring-(--destaque)" : "bg-white/6 ring-white/12"
                    }`}
                  >
                    <input type="checkbox" checked={marcado} onChange={() => onAlternarAdicional(adicional.id)} className="size-4 accent-(--destaque)" />
                    <span className="min-w-0 flex-1 break-words">{adicional.nome}</span>
                    <span className="shrink-0 font-semibold text-white">+ {formatarMoeda(adicional.valor)}</span>
                  </label>
                );
              })}
            </motion.fieldset>
          )}

          {item.ingredientes.length > 0 && (
            <motion.section custom={4} variants={aparecer} initial="oculto" animate="visivel">
              <h4 className={`mb-2 ${CLASSE_TITULO}`}>Ingredientes</h4>
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

          <motion.section custom={5} variants={aparecer} initial="oculto" animate="visivel" className="flex flex-col items-start gap-1">
            <h4 className={CLASSE_TITULO}>Sua avaliação</h4>
            <EscolhaEstrelas valor={cliente.minhaAvaliacao(item.id)} onEscolher={avaliar} />
            {!cliente.cliente && <p className="text-xs text-(--texto-fraco)">Para avaliar, você se identifica rapidinho.</p>}
          </motion.section>

          <SecaoComentarios ref={secaoComentarios} slug={slug} itemId={item.id} cliente={cliente} />
        </div>
      )}
    </BottomSheet>
  );
}
