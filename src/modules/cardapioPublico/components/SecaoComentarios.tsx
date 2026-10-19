/**
 * @description Comentários do prato, no fim do detalhe: lista pública (mais novos primeiro, "Ver mais") e o campo
 * para comentar, que pede a identificação a quem ainda não se identificou.
 */
import { forwardRef, useState, type FormEvent } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { ChatCircleIcon, CircleNotchIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro, statusDoErro } from "@/api/mensagemErro";

import type { ClienteCardapio } from "../hooks/useCliente";
import { comentarItem, listarComentarios } from "../services/cardapioPublicoService";

type SecaoComentariosProps = {
  slug: string;
  itemId: string;
  cliente: ClienteCardapio;
};

/** Espelha o `@Size(max = 500)` do `ComentarioRequestDTO`. */
const MAXIMO_CARACTERES = 500;

const quando = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export const SecaoComentarios = forwardRef<HTMLElement, SecaoComentariosProps>(function SecaoComentarios({ slug, itemId, cliente }, ref) {
  const queryClient = useQueryClient();
  const [texto, setTexto] = useState("");
  const chave = ["comentarios", slug, itemId];

  const query = useInfiniteQuery({
    queryKey: chave,
    queryFn: ({ pageParam }) => listarComentarios(slug, itemId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.number + 1 < ultima.totalPages ? ultima.number + 1 : undefined),
  });

  const comentar = useMutation({
    mutationFn: ({ token, mensagem }: { token: string; mensagem: string }) => comentarItem(slug, itemId, mensagem, token),
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: chave });
      // A contagem do card vem no cardápio.
      queryClient.invalidateQueries({ queryKey: ["cardapio-publico", slug] });
    },
    onError: (erro, { mensagem }) => {
      // Token recusado (cadastro apagado, outro restaurante): identifica de novo e publica o mesmo texto.
      if (statusDoErro(erro) === 401) cliente.esquecer((token) => comentar.mutate({ token, mensagem }));
      else toast.error(mensagemSeguraDeErro(erro, "Não foi possível publicar o comentário."));
    },
  });

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const mensagem = texto.trim();
    if (mensagem) cliente.exigir((token) => comentar.mutate({ token, mensagem }));
  };

  const comentarios = query.data?.pages.flatMap((pagina) => pagina.content) ?? [];

  return (
    <section ref={ref} aria-labelledby={`comentarios-${itemId}`} className="flex scroll-mt-4 flex-col gap-3">
      <h4 id={`comentarios-${itemId}`} className="text-xs font-semibold tracking-wider text-(--texto-fraco) uppercase">
        Comentários
      </h4>

      <form onSubmit={enviar} className="flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">Seu comentário</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={MAXIMO_CARACTERES}
            rows={2}
            placeholder={cliente.cliente ? `Comentar como ${cliente.cliente.nome.split(" ")[0]}` : "O que achou deste prato?"}
            className="w-full resize-none rounded-2xl bg-white/6 px-4 py-3 text-[15px] ring-1 ring-white/10 outline-none placeholder:text-(--texto-fraco) focus:ring-2 focus:ring-(--destaque)/70"
          />
        </label>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.85 }}
          disabled={!texto.trim() || comentar.isPending}
          aria-label="Publicar comentário"
          className="mb-1 grid size-11 shrink-0 place-items-center rounded-full gradiente-destaque text-(--sobre-destaque) disabled:opacity-40"
        >
          {comentar.isPending ? <CircleNotchIcon size={18} className="animate-spin" aria-hidden /> : <PaperPlaneRightIcon size={18} weight="fill" aria-hidden />}
        </motion.button>
      </form>

      {query.isPending ? (
        <div className="h-16 rounded-2xl shimmer" role="status" aria-label="Carregando comentários" />
      ) : query.isError ? (
        <p className="text-sm text-(--texto-suave)">Não foi possível carregar os comentários.</p>
      ) : comentarios.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-(--texto-suave)">
          <ChatCircleIcon size={18} aria-hidden /> Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {comentarios.map((comentario) => (
              <motion.li
                key={comentario.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/8"
              >
                <p className="text-sm">
                  <span className="font-semibold">{comentario.autor}</span>
                  <span className="ml-2 text-xs text-(--texto-fraco)">{quando(comentario.criadoEm)}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-(--texto-suave)">{comentario.texto}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="self-center rounded-full px-4 py-2 text-sm font-medium text-(--destaque) disabled:opacity-50"
        >
          {query.isFetchingNextPage ? "Carregando…" : "Ver mais comentários"}
        </button>
      )}
    </section>
  );
});
