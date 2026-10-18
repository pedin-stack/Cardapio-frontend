/**
 * @description Aparência do restaurante (gestor): a cor de destaque do cardápio público.
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowSquareOutIcon, FloppyDiskIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { Botao } from "@/components/Botao";
import { CampoCor } from "@/components/inputs/CampoCor";
import { PainelShell } from "@/components/PainelShell";
import { ErrorState, LoadingState } from "@/components/UIStates";

import { ABAS_GESTAO } from "../navegacao";
import { atualizarCorDestaque, buscarMeuRestaurante } from "../services/meuRestauranteService";

const CHAVE_MEU_RESTAURANTE = ["meu-restaurante"] as const;

export default function RestaurantePage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: CHAVE_MEU_RESTAURANTE, queryFn: buscarMeuRestaurante });
  const salvar = useMutation({
    mutationFn: atualizarCorDestaque,
    onSuccess: (restaurante) => {
      queryClient.setQueryData(CHAVE_MEU_RESTAURANTE, restaurante);
      toast.success("Cor salva. O cardápio atualiza em até 30 segundos.");
    },
    onError: (erro) => toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar a cor.")),
  });

  const salva = query.data?.corDestaque ?? null;
  const [cor, setCor] = useState<string | null>(null);
  useEffect(() => setCor(salva), [salva]);

  return (
    <PainelShell titulo="Restaurante" abas={ABAS_GESTAO}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState mensagem={mensagemSeguraDeErro(query.error, "Não foi possível carregar o restaurante.")} onRetry={() => query.refetch()} />
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 rounded-3xl bg-white/[0.03] p-4 ring-1 ring-white/8"
        >
          <div>
            <h2 className="font-display text-lg font-semibold">{query.data.nome}</h2>
            <p className="text-sm text-(--texto-suave)">A cor aparece nos preços, botões e destaques do seu cardápio.</p>
          </div>

          <CampoCor cor={cor} onChange={setCor} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={`/${query.data.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-(--texto-suave) hover:text-(--texto)"
            >
              Ver meu cardápio
              <ArrowSquareOutIcon size={16} aria-hidden />
            </a>
            <Botao
              icone={<FloppyDiskIcon size={18} weight="bold" aria-hidden />}
              loading={salvar.isPending}
              disabled={cor === salva}
              onClick={() => salvar.mutate(cor)}
            >
              Salvar cor
            </Botao>
          </div>
        </motion.section>
      )}
    </PainelShell>
  );
}
