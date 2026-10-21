/**
 * @description Lista de itens do cardápio do gestor (21 por página), com filtro por categorias e acesso ao
 * cardápio público.
 */
import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowSquareOutIcon, CheckIcon, EyeSlashIcon, ForkKnifeIcon, PlusIcon, TagIcon } from "@phosphor-icons/react";

import { useAuth } from "@/auth/useAuth";
import { PainelShell } from "@/components/PainelShell";
import { Paginacao } from "@/components/Paginacao";
import { EmptyState, ErrorState, LoadingState } from "@/components/UIStates";
import { formatarMoeda } from "@/utils/formatarMoeda";

import { StatusVideoBadge } from "../components/StatusVideoBadge";
import { useCategorias } from "../hooks/useCategorias";
import { useItensCardapioPagina } from "../hooks/useItensCardapio";
import { ABAS_GESTAO } from "../navegacao";

export default function ItensPage() {
  const { usuario } = useAuth();
  const { categorias } = useCategorias();
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const { itens, totalPages, loading, atualizando, erro, refetch } = useItensCardapioPagina(categoriaIds, page);

  const filtrar = (ids: string[]) => {
    setCategoriaIds(ids);
    setPage(0);
  };
  const alternar = (id: string) => filtrar(categoriaIds.includes(id) ? categoriaIds.filter((outro) => outro !== id) : [...categoriaIds, id]);
  const irPara = (nova: number) => {
    setPage(nova);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PainelShell
      titulo="Itens do cardápio"
      abas={ABAS_GESTAO}
      acoes={
        usuario?.restauranteSlug && (
          <Link
            href={`/${usuario.restauranteSlug}`}
            target="_blank"
            aria-label="Abrir cardápio público"
            className="grid size-10 place-items-center rounded-full bg-(--superficie-forte) ring-1 ring-(--borda) transition hover:bg-(--superficie-max)"
          >
            <ArrowSquareOutIcon size={18} weight="bold" aria-hidden />
          </Link>
        )
      }
    >
      {categorias.length > 0 && (
        // Celular: uma linha que rola de lado; notebook/PC: quebra em linhas.
        <div role="group" aria-label="Filtrar por categoria" className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-wrap">
          <Chip ativo={categoriaIds.length === 0} onClick={() => filtrar([])}>
            Todas
          </Chip>
          {categorias.map((categoria) => (
            <Chip key={categoria.id} ativo={categoriaIds.includes(categoria.id)} onClick={() => alternar(categoria.id)}>
              {categoria.nome}
            </Chip>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : itens.length === 0 && categoriaIds.length > 0 ? (
        <EmptyState
          icone={<TagIcon size={44} weight="duotone" aria-hidden />}
          titulo="Nenhum item nessas categorias"
          acao={
            <button type="button" onClick={() => filtrar([])} className="rounded-full vidro-claro px-5 py-2 text-sm font-medium transition hover:bg-(--superficie-max)">
              Ver todos os itens
            </button>
          }
        />
      ) : itens.length === 0 ? (
        <EmptyState
          icone={<ForkKnifeIcon size={48} weight="duotone" aria-hidden />}
          titulo="Seu cardápio está vazio"
          descricao="Cadastre o primeiro prato com fotos e um vídeo curto."
          acao={
            <Link href="/painel/itens/novo" className="inline-flex items-center gap-2 rounded-full gradiente-destaque px-5 py-2.5 text-sm font-semibold text-(--sobre-destaque)">
              <PlusIcon size={16} weight="bold" aria-hidden /> Novo item
            </Link>
          }
        />
      ) : (
        <ul className={`grid gap-3 transition-opacity duration-300 sm:grid-cols-2 xl:grid-cols-3 ${atualizando ? "opacity-60" : "opacity-100"}`}>
          {itens.map((item, i) => {
            const capa = item.imagens[0]?.url ?? item.video.posterUrl;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/painel/itens/${item.id}`}
                  className="group flex min-w-0 gap-3 rounded-3xl bg-(--bg-elevado) p-2.5 ring-1 ring-(--borda) transition hover:ring-(--principal)/60"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-(--superficie)">
                    {capa ? (
                      <Image src={capa} alt="" fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <ForkKnifeIcon size={26} className="absolute inset-0 m-auto text-(--texto-fraco)" aria-hidden />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{item.nome}</p>
                      {!item.ativo && <EyeSlashIcon size={16} className="shrink-0 text-(--texto-fraco)" aria-label="Oculto no cardápio" />}
                    </div>
                    <p className="text-sm font-semibold">{formatarMoeda(item.valor)}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusVideoBadge status={item.video.status} />
                      {item.categorias.slice(0, 2).map((categoria) => (
                        <span key={categoria.id} className="truncate rounded-full bg-(--superficie-forte) px-2 py-0.5 text-[11px] text-(--texto-suave)">
                          {categoria.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}

      <Paginacao page={page} totalPages={totalPages} onChange={irPara} />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 18 }}
        className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-30 lg:right-8 lg:bottom-8"
      >
        <Link
          href="/painel/itens/novo"
          aria-label="Novo item"
          className="grid size-14 place-items-center rounded-full gradiente-destaque text-(--sobre-destaque) sombra-destaque transition active:scale-90"
        >
          <PlusIcon size={26} weight="bold" aria-hidden />
        </Link>
      </motion.div>
    </PainelShell>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap ring-1 transition-colors ${
        ativo ? "bg-(--destaque-suave) text-(--texto) ring-(--destaque)/60" : "bg-(--superficie) text-(--texto-suave) ring-(--borda) hover:text-(--texto)"
      }`}
    >
      {ativo && <CheckIcon size={14} weight="bold" aria-hidden />}
      {children}
    </button>
  );
}
