/**
 * @description Cadastro/edição do item: nome, categorias (várias), descrição, valor, ingredientes, especificações,
 * até 8 fotos e 1 vídeo. Rota `/painel/itens/novo` cria; `/painel/itens/{id}` edita (e modera os comentários).
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeftIcon, FloppyDiskIcon, TrashIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { Botao } from "@/components/Botao";
import { ConfirmacaoSheet } from "@/components/ConfirmacaoSheet";
import { InputField, TextareaField } from "@/components/inputs/InputField";
import { PainelShell } from "@/components/PainelShell";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { ErrorState, LoadingState } from "@/components/UIStates";

import { CampoEspecificacoes } from "../components/CampoEspecificacoes";
import { ComentariosItem } from "../components/ComentariosItem";
import { CampoIngredientes } from "../components/CampoIngredientes";
import { CampoVideo } from "../components/CampoVideo";
import { GaleriaImagens } from "../components/GaleriaImagens";
import { SeletorCategorias } from "../components/SeletorCategorias";
import { useItemCardapio, useItemCardapioAcoes } from "../hooks/useItensCardapio";
import { ABAS_GESTAO } from "../navegacao";
import { itemCardapioSchema, type ItemCardapioForm } from "../schemas/itemCardapio.schema";
import type { ItemCardapio, ItemCardapioPayload } from "../types/gestaoCardapio";

const VAZIO: ItemCardapioForm = {
  nome: "",
  descricao: "",
  valor: Number.NaN,
  ativo: true,
  ordem: 0,
  categoriaIds: [],
  ingredientes: [],
  especificacoes: [],
  imagens: [],
  video: null,
};

function paraFormulario(item: ItemCardapio): ItemCardapioForm {
  return {
    nome: item.nome,
    descricao: item.descricao ?? "",
    valor: item.valor,
    ativo: item.ativo,
    ordem: item.ordem,
    categoriaIds: item.categorias.map((c) => c.id),
    ingredientes: item.ingredientes,
    especificacoes: item.especificacoes ?? [],
    imagens: item.imagens,
    video: item.video.caminhoOriginal
      ? { caminho: item.video.caminhoOriginal, hlsUrl: item.video.hlsUrl, posterUrl: item.video.posterUrl }
      : null,
  };
}

function paraPayload(form: ItemCardapioForm): ItemCardapioPayload {
  return {
    nome: form.nome.trim(),
    descricao: form.descricao.trim() || undefined,
    valor: Math.round(form.valor * 100) / 100,
    ativo: form.ativo,
    ordem: form.ordem,
    categoriaIds: form.categoriaIds,
    ingredientes: form.ingredientes,
    especificacoes: form.especificacoes.map((e) => ({ nome: e.nome.trim(), opcoes: e.opcoes })),
    imagens: form.imagens.map((imagem) => imagem.caminho),
    videoCaminho: form.video?.caminho,
  };
}

const secao = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

export default function ItemFormPage() {
  const router = useRouter();
  const idRota = typeof router.query.id === "string" ? router.query.id : undefined;
  const id = idRota && idRota !== "novo" ? idRota : undefined;
  const { item, loading, erro, refetch } = useItemCardapio(id);
  const { salvar, excluir } = useItemCardapioAcoes();
  const [enviandoMidia, setEnviandoMidia] = useState(0);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ItemCardapioForm>({ resolver: zodResolver(itemCardapioSchema), defaultValues: VAZIO });

  // Recarrega o formulário com o item salvo; o polling do vídeo não pode apagar uma edição em andamento.
  useEffect(() => {
    if (item && !isDirty) reset(paraFormulario(item));
  }, [item, isDirty, reset]);

  const contarEnvio = (ativo: boolean) => setEnviandoMidia((n) => n + (ativo ? 1 : -1));

  const aoSalvar = async (form: ItemCardapioForm) => {
    try {
      await salvar.mutateAsync({ id, payload: paraPayload(form) });
      toast.success(form.video && !form.video.hlsUrl ? "Item salvo! O vídeo está sendo processado." : "Item salvo!");
      router.push("/painel");
    } catch (e) {
      toast.error(mensagemSeguraDeErro(e, "Não foi possível salvar o item."));
    }
  };

  const aoExcluir = async () => {
    if (!id) return;
    try {
      await excluir.mutateAsync(id);
      toast.success("Item excluído.");
      router.push("/painel");
    } catch (e) {
      toast.error(mensagemSeguraDeErro(e, "Não foi possível excluir o item."));
    }
  };

  return (
    <PainelShell
      titulo={id ? "Editar item" : "Novo item"}
      abas={ABAS_GESTAO}
      acoes={
        <Link href="/painel" aria-label="Voltar para os itens" className="grid size-10 place-items-center rounded-full bg-white/8 ring-1 ring-white/10">
          <ArrowLeftIcon size={18} weight="bold" aria-hidden />
        </Link>
      }
    >
      {id && loading ? (
        <LoadingState />
      ) : id && erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : (
        // Notebook/PC: mídia fixa na coluna da esquerda, campos na da direita.
        <form onSubmit={handleSubmit(aoSalvar)} noValidate className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <motion.section
            custom={0}
            variants={secao}
            initial="oculto"
            animate="visivel"
            className="flex flex-col gap-5 rounded-3xl bg-white/[0.03] p-4 ring-1 ring-white/8 lg:sticky lg:top-24 lg:row-span-2"
          >
            <Controller
              control={control}
              name="imagens"
              render={({ field }) => <GaleriaImagens imagens={field.value} onChange={field.onChange} onEnviando={contarEnvio} />}
            />
            <Controller
              control={control}
              name="video"
              render={({ field }) => (
                <CampoVideo video={field.value} status={item?.video.status} onChange={field.onChange} onEnviando={contarEnvio} />
              )}
            />
          </motion.section>

          <motion.section custom={1} variants={secao} initial="oculto" animate="visivel" className="flex flex-col gap-4">
            <InputField label="Nome do prato" placeholder="Ex.: Cappuccino italiano" erro={errors.nome?.message} {...register("nome")} />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Valor (R$)"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                erro={errors.valor?.message}
                {...register("valor", { valueAsNumber: true })}
              />
              <InputField
                label="Ordem no feed"
                type="number"
                inputMode="numeric"
                min="0"
                erro={errors.ordem?.message}
                dica="Menor aparece antes"
                {...register("ordem", { valueAsNumber: true })}
              />
            </div>
            <TextareaField label="Descrição" placeholder="Conte o que torna este prato especial." erro={errors.descricao?.message} {...register("descricao")} />
          </motion.section>

          <motion.section custom={2} variants={secao} initial="oculto" animate="visivel" className="flex flex-col gap-5">
            <Controller
              control={control}
              name="categoriaIds"
              render={({ field }) => <SeletorCategorias selecionadas={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name="ingredientes"
              render={({ field }) => <CampoIngredientes ingredientes={field.value} onChange={field.onChange} erro={errors.ingredientes?.message} />}
            />
            <Controller
              control={control}
              name="especificacoes"
              render={({ field }) => (
                <CampoEspecificacoes
                  especificacoes={field.value}
                  onChange={field.onChange}
                  erros={field.value.map((_, i) => ({
                    nome: errors.especificacoes?.[i]?.nome?.message,
                    opcoes: errors.especificacoes?.[i]?.opcoes?.message,
                  }))}
                  erro={errors.especificacoes?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="ativo"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/8">
                  <div>
                    <p className="font-medium">Visível no cardápio</p>
                    <p className="text-xs text-(--texto-fraco)">Desligue para esconder sem excluir.</p>
                  </div>
                  <ToggleSwitch checked={field.value} onChange={field.onChange} rotulo="Visível no cardápio" />
                </div>
              )}
            />
          </motion.section>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between lg:col-span-2">
            {id ? (
              <Botao variante="perigo" icone={<TrashIcon size={16} weight="bold" aria-hidden />} onClick={() => setConfirmarExclusao(true)}>
                Excluir
              </Botao>
            ) : (
              <span />
            )}
            <Botao
              type="submit"
              loading={salvar.isPending}
              disabled={enviandoMidia > 0}
              icone={<FloppyDiskIcon size={18} weight="bold" aria-hidden />}
              className="py-3 sm:min-w-44"
            >
              {enviandoMidia > 0 ? "Aguardando envio…" : "Salvar item"}
            </Botao>
          </div>
        </form>
      )}

      {id && item && <ComentariosItem itemId={id} />}

      <ConfirmacaoSheet
        isOpen={confirmarExclusao}
        titulo="Excluir este item?"
        descricao="O prato sai do cardápio e suas curtidas e métricas são apagadas. Não dá para desfazer."
        rotuloConfirmar="Excluir item"
        perigo
        loading={excluir.isPending}
        onConfirm={aoExcluir}
        onClose={() => setConfirmarExclusao(false)}
      />
    </PainelShell>
  );
}
