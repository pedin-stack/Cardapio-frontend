/**
 * @description Restaurantes da plataforma (super admin): busca, ativar/desativar e acesso ao cadastro.
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowSquareOutIcon, CaretLeftIcon, CaretRightIcon, MagnifyingGlassIcon, PencilSimpleIcon, PlusIcon, StorefrontIcon } from "@phosphor-icons/react";

import { ConfirmacaoSheet } from "@/components/ConfirmacaoSheet";
import { PainelShell } from "@/components/PainelShell";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { EmptyState, ErrorState, LoadingState } from "@/components/UIStates";

import { useRestauranteAcoes, useRestaurantesPesquisa } from "../hooks/useRestaurantes";
import { ABAS_PLATAFORMA } from "../navegacao";
import type { Restaurante } from "../types/restaurante";

export default function RestaurantesPage() {
  const { restaurantes, totalPages, page, irPara, busca, setBusca, loading, erro, refetch } = useRestaurantesPesquisa();
  const { alternarStatus } = useRestauranteAcoes();
  const [desativando, setDesativando] = useState<Restaurante | null>(null);

  const aoAlternar = (restaurante: Restaurante, ativo: boolean) => {
    // Desativar tira o cardápio do ar na hora: pede confirmação. Reativar é imediato.
    if (!ativo) setDesativando(restaurante);
    else alternarStatus.mutate({ id: restaurante.id, ativo: true });
  };

  return (
    <PainelShell titulo="Restaurantes" abas={ABAS_PLATAFORMA}>
      <label className="mb-5 flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-3 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-(--destaque)/70">
        <MagnifyingGlassIcon size={18} className="text-(--texto-fraco)" aria-hidden />
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar restaurante"
          aria-label="Buscar restaurante pelo nome"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--texto-fraco)"
        />
      </label>

      {loading ? (
        <LoadingState />
      ) : erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : restaurantes.length === 0 ? (
        <EmptyState
          icone={<StorefrontIcon size={48} weight="duotone" aria-hidden />}
          titulo={busca ? "Nenhum restaurante encontrado" : "Nenhum restaurante ainda"}
          descricao={busca ? "Tente outro nome." : "Cadastre o primeiro restaurante e o seu gestor."}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {restaurantes.map((restaurante, i) => (
              <motion.li
                key={restaurante.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/8"
              >
                <div className="relative h-24 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,74,0.35),transparent_60%),#121218]">
                  {restaurante.capaUrl && (
                    <Image src={restaurante.capaUrl} alt="" fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <motion.span
                    animate={{ opacity: restaurante.ativo ? 1 : 0.9 }}
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur ${
                      restaurante.ativo ? "bg-(--sucesso)/20 text-(--sucesso)" : "bg-(--perigo)/20 text-(--perigo)"
                    }`}
                  >
                    {restaurante.ativo ? "● No ar" : "● Desativado"}
                  </motion.span>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="relative -mt-10 size-14 shrink-0 overflow-hidden rounded-2xl bg-(--bg-elevado) ring-2 ring-(--bg)">
                    {restaurante.logoUrl ? (
                      <Image src={restaurante.logoUrl} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <StorefrontIcon size={24} className="absolute inset-0 m-auto text-white/40" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{restaurante.nome}</p>
                    <Link href={`/${restaurante.slug}`} target="_blank" className="inline-flex max-w-full items-center gap-1 text-xs text-(--texto-suave) hover:text-white">
                      <span className="truncate">/{restaurante.slug}</span>
                      <ArrowSquareOutIcon size={12} className="shrink-0" aria-hidden />
                    </Link>
                  </div>
                  <ToggleSwitch
                    checked={restaurante.ativo}
                    onChange={(ativo) => aoAlternar(restaurante, ativo)}
                    rotulo={`${restaurante.ativo ? "Desativar" : "Ativar"} ${restaurante.nome}`}
                  />
                  <Link
                    href={`/plataforma/restaurantes/${restaurante.id}`}
                    aria-label={`Editar ${restaurante.nome}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-white/8 hover:bg-white/15"
                  >
                    <PencilSimpleIcon size={16} aria-hidden />
                  </Link>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button type="button" onClick={() => irPara(page - 1)} disabled={page === 0} aria-label="Página anterior" className="grid size-9 place-items-center rounded-full bg-white/8 disabled:opacity-30">
            <CaretLeftIcon size={16} aria-hidden />
          </button>
          <span className="text-(--texto-suave) tabular-nums">
            {page + 1} de {totalPages}
          </span>
          <button type="button" onClick={() => irPara(page + 1)} disabled={page + 1 >= totalPages} aria-label="Próxima página" className="grid size-9 place-items-center rounded-full bg-white/8 disabled:opacity-30">
            <CaretRightIcon size={16} aria-hidden />
          </button>
        </nav>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 18 }}
        className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] z-30"
      >
        <Link
          href="/plataforma/restaurantes/novo"
          aria-label="Novo restaurante"
          className="grid size-14 place-items-center rounded-full gradiente-destaque shadow-[0_12px_40px_-8px_rgba(255,107,74,0.9)] transition active:scale-90"
        >
          <PlusIcon size={26} weight="bold" aria-hidden />
        </Link>
      </motion.div>

      <ConfirmacaoSheet
        isOpen={Boolean(desativando)}
        titulo={`Desativar ${desativando?.nome ?? ""}?`}
        descricao="O cardápio passa a mostrar “Serviço indisponível” e o gestor perde o acesso ao painel até você reativar."
        rotuloConfirmar="Desativar"
        perigo
        onConfirm={() => {
          if (desativando) alternarStatus.mutate({ id: desativando.id, ativo: false });
          setDesativando(null);
        }}
        onClose={() => setDesativando(null)}
      />
    </PainelShell>
  );
}
