/**
 * @description Aparência do cardápio (gestor): cor de destaque, logo horizontal do cabeçalho, vídeo de fundo da capa
 * e redes sociais (WhatsApp e Instagram).
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowSquareOutIcon, FloppyDiskIcon } from "@phosphor-icons/react";

import type { ArquivoEnviado } from "@/actions/uploadService";
import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { Botao } from "@/components/Botao";
import { CampoCor } from "@/components/inputs/CampoCor";
import { InputField } from "@/components/inputs/InputField";
import { PainelShell } from "@/components/PainelShell";
import { ErrorState, LoadingState } from "@/components/UIStates";
import { CampoImagem } from "@/modules/plataforma/components/CampoImagem";
import { mascararTelefone, soDigitos } from "@/utils/mascaras";

import { CampoVideo } from "../components/CampoVideo";
import { ABAS_GESTAO } from "../navegacao";
import type { ItemCardapioForm } from "../schemas/itemCardapio.schema";
import { atualizarAparencia, buscarMeuRestaurante } from "../services/meuRestauranteService";
import type { AparenciaPayload, MeuRestaurante } from "../types/gestaoCardapio";

const CHAVE_MEU_RESTAURANTE = ["meu-restaurante"] as const;
/** Espelha o `@Pattern` do instagram no `RestauranteAparenciaRequestDTO`. */
const INSTAGRAM = /^[A-Za-z0-9._]{1,30}$/;

type FormAparencia = {
  cor: string | null;
  logo: ArquivoEnviado | null;
  video: ItemCardapioForm["video"];
  /** Com máscara; vai só com dígitos. */
  whatsapp: string;
  instagram: string;
};

function doRestaurante(restaurante: MeuRestaurante): FormAparencia {
  const { video } = restaurante;
  return {
    cor: restaurante.corDestaque ?? null,
    logo: restaurante.logoCabecalhoPath && restaurante.logoCabecalhoUrl ? { caminho: restaurante.logoCabecalhoPath, url: restaurante.logoCabecalhoUrl } : null,
    video: video.caminhoOriginal ? { caminho: video.caminhoOriginal, hlsUrl: video.hlsUrl, posterUrl: video.posterUrl } : null,
    whatsapp: mascararTelefone(restaurante.whatsapp ?? ""),
    instagram: restaurante.instagram ?? "",
  };
}

function paraPayload(form: FormAparencia): AparenciaPayload {
  return {
    corDestaque: form.cor,
    logoCabecalhoPath: form.logo?.caminho ?? null,
    videoCaminho: form.video?.caminho ?? null,
    whatsapp: soDigitos(form.whatsapp) || null,
    instagram: form.instagram.trim().replace(/^@/, "") || null,
  };
}

const mesmoPayload = (a: FormAparencia, b: FormAparencia) => JSON.stringify(paraPayload(a)) === JSON.stringify(paraPayload(b));

export default function RestaurantePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: CHAVE_MEU_RESTAURANTE,
    queryFn: buscarMeuRestaurante,
    // Acompanha o vídeo da capa até ficar pronto.
    refetchInterval: (q) => (q.state.data?.video.status === "PROCESSANDO" ? 5000 : false),
  });
  const salvo = query.data;
  const [form, setForm] = useState<FormAparencia | null>(null);
  const [enviando, setEnviando] = useState(0);

  // Segue o servidor (ex.: o vídeo terminando de processar) enquanto não houver edição pendente.
  useEffect(() => {
    if (salvo) setForm((atual) => (atual && !mesmoPayload(atual, doRestaurante(salvo)) ? atual : doRestaurante(salvo)));
  }, [salvo]);

  const salvar = useMutation({
    mutationFn: atualizarAparencia,
    onSuccess: (restaurante) => {
      queryClient.setQueryData(CHAVE_MEU_RESTAURANTE, restaurante);
      toast.success(
        restaurante.video.status === "PROCESSANDO"
          ? "Salvo! O vídeo da capa está sendo processado."
          : "Aparência salva. O cardápio atualiza em até 30 segundos.",
      );
    },
    onError: (erro) => toast.error(mensagemSeguraDeErro(erro, "Não foi possível salvar a aparência.")),
  });

  const mudar = (parcial: Partial<FormAparencia>) => setForm((atual) => (atual ? { ...atual, ...parcial } : atual));
  const contarEnvio = (ativo: boolean) => setEnviando((n) => n + (ativo ? 1 : -1));

  if (query.error) {
    return (
      <PainelShell titulo="Restaurante" abas={ABAS_GESTAO}>
        <ErrorState mensagem={mensagemSeguraDeErro(query.error, "Não foi possível carregar o restaurante.")} onRetry={() => query.refetch()} />
      </PainelShell>
    );
  }
  if (!salvo || !form) {
    return (
      <PainelShell titulo="Restaurante" abas={ABAS_GESTAO}>
        <LoadingState />
      </PainelShell>
    );
  }

  const whatsapp = soDigitos(form.whatsapp);
  const erroWhatsapp = whatsapp && whatsapp.length < 10 ? "Informe o WhatsApp com DDD." : undefined;
  const instagram = form.instagram.trim().replace(/^@/, "");
  const erroInstagram = instagram && !INSTAGRAM.test(instagram) ? "Use só o usuário (letras, números, ponto e _)." : undefined;
  const alterado = !mesmoPayload(form, doRestaurante(salvo));

  return (
    <PainelShell titulo="Restaurante" abas={ABAS_GESTAO}>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 rounded-3xl bg-(--bg-elevado) p-4 ring-1 ring-(--borda) lg:max-w-2xl lg:p-6"
      >
        <div>
          <h2 className="font-display text-lg font-semibold">{salvo.nome}</h2>
          <p className="text-sm text-(--texto-suave)">Como o seu cardápio aparece para os clientes.</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-(--texto-suave)">Cor de destaque</span>
          <p className="text-xs text-(--texto-fraco)">Aparece nos preços, botões e destaques do cardápio.</p>
          <CampoCor cor={form.cor} onChange={(cor) => mudar({ cor })} />
        </div>

        <CampoImagem
          rotulo="Logo do cabeçalho"
          dica="Horizontal e recortada, de preferência PNG com fundo transparente."
          valor={form.logo}
          formato="paisagem"
          inteira
          onChange={(logo) => mudar({ logo })}
          onEnviando={contarEnvio}
        />

        <CampoVideo
          // Novo vídeo salvo (ou removido): recomeça o campo para mostrar o status do servidor.
          key={salvo.video.caminhoOriginal ?? "sem-video"}
          rotulo="Vídeo de fundo da capa"
          video={form.video}
          status={salvo.video.status}
          onChange={(video) => mudar({ video })}
          onEnviando={contarEnvio}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(e) => mudar({ whatsapp: mascararTelefone(e.target.value) })}
            inputMode="tel"
            placeholder="(74) 99999-8888"
            erro={erroWhatsapp}
          />
          <InputField
            label="Instagram"
            value={form.instagram}
            onChange={(e) => mudar({ instagram: e.target.value })}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="@seurestaurante"
            erro={erroInstagram}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href={`/${salvo.slug}`}
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
            disabled={!alterado || enviando > 0 || Boolean(erroWhatsapp || erroInstagram)}
            onClick={() => salvar.mutate(paraPayload(form))}
          >
            {enviando > 0 ? "Aguardando envio…" : "Salvar"}
          </Botao>
        </div>
      </motion.section>
    </PainelShell>
  );
}
