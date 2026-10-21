/**
 * @description Cadastro/edição de restaurante (super admin). No cadastro cria também a conta do gestor;
 * na edição a senha do gestor é opcional (redefine). `/plataforma/restaurantes/novo` cria.
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
import { CampoCor } from "@/components/inputs/CampoCor";
import { InputField, TextareaField } from "@/components/inputs/InputField";
import { PainelShell } from "@/components/PainelShell";
import { ErrorState, LoadingState } from "@/components/UIStates";

import { CampoImagem } from "../components/CampoImagem";
import { useRestaurante, useRestauranteAcoes } from "../hooks/useRestaurantes";
import { ABAS_PLATAFORMA } from "../navegacao";
import { gerarSlug, restauranteCriarSchema, restauranteEditarSchema, type RestauranteForm } from "../schemas/restaurante.schema";
import type { Restaurante } from "../types/restaurante";

const VAZIO: RestauranteForm = {
  nome: "",
  slug: "",
  descricao: "",
  logo: null,
  capa: null,
  corDestaque: null,
  gestorNome: "",
  gestorEmail: "",
  gestorSenha: "",
};

function paraFormulario(r: Restaurante): RestauranteForm {
  return {
    nome: r.nome,
    slug: r.slug,
    descricao: r.descricao ?? "",
    logo: r.logoPath && r.logoUrl ? { caminho: r.logoPath, url: r.logoUrl } : null,
    capa: r.capaPath && r.capaUrl ? { caminho: r.capaPath, url: r.capaUrl } : null,
    corDestaque: r.corDestaque ?? null,
    gestorNome: r.gestorNome ?? "",
    gestorEmail: r.gestorEmail ?? "",
    gestorSenha: "",
  };
}

export default function RestauranteFormPage() {
  const router = useRouter();
  const idRota = typeof router.query.id === "string" ? router.query.id : undefined;
  const id = idRota && idRota !== "novo" ? idRota : undefined;
  const { restaurante, loading, erro, refetch } = useRestaurante(id);
  const { criar, atualizar, excluir } = useRestauranteAcoes();
  const [enviando, setEnviando] = useState(0);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [slugEditado, setSlugEditado] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RestauranteForm>({ resolver: zodResolver(id ? restauranteEditarSchema : restauranteCriarSchema), defaultValues: VAZIO });

  useEffect(() => {
    if (restaurante) {
      reset(paraFormulario(restaurante));
      setSlugEditado(true);
    }
  }, [restaurante, reset]);

  // No cadastro, o endereço acompanha o nome até a pessoa mexer nele.
  const nome = watch("nome");
  useEffect(() => {
    if (!slugEditado) setValue("slug", gerarSlug(nome));
  }, [nome, slugEditado, setValue]);

  const contarEnvio = (ativo: boolean) => setEnviando((n) => n + (ativo ? 1 : -1));

  const aoSalvar = async (form: RestauranteForm) => {
    const comum = {
      nome: form.nome.trim(),
      slug: form.slug,
      descricao: form.descricao.trim() || undefined,
      logoPath: form.logo?.caminho,
      capaPath: form.capa?.caminho,
      corDestaque: form.corDestaque ?? undefined,
    };
    try {
      if (id) {
        await atualizar.mutateAsync({ id, payload: { ...comum, gestorSenha: form.gestorSenha || undefined } });
        toast.success("Restaurante atualizado.");
      } else {
        await criar.mutateAsync({ ...comum, gestorNome: form.gestorNome.trim(), gestorEmail: form.gestorEmail.trim(), gestorSenha: form.gestorSenha });
        toast.success("Restaurante cadastrado! Envie o e-mail e a senha ao gestor.");
      }
      router.push("/plataforma");
    } catch (e) {
      toast.error(mensagemSeguraDeErro(e, "Não foi possível salvar o restaurante."));
    }
  };

  const aoExcluir = async () => {
    if (!id) return;
    try {
      await excluir.mutateAsync(id);
      toast.success("Restaurante excluído.");
      router.push("/plataforma");
    } catch (e) {
      toast.error(mensagemSeguraDeErro(e, "Não foi possível excluir o restaurante."));
    }
  };

  return (
    <PainelShell
      titulo={id ? "Editar restaurante" : "Novo restaurante"}
      abas={ABAS_PLATAFORMA}
      acoes={
        <Link href="/plataforma" aria-label="Voltar para os restaurantes" className="grid size-10 place-items-center rounded-full bg-(--superficie-forte) ring-1 ring-(--borda)">
          <ArrowLeftIcon size={18} weight="bold" aria-hidden />
        </Link>
      }
    >
      {id && loading ? (
        <LoadingState />
      ) : id && erro ? (
        <ErrorState mensagem={erro} onRetry={() => refetch()} />
      ) : (
        <motion.form
          onSubmit={handleSubmit(aoSalvar)}
          noValidate
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          // Notebook/PC: imagens e gestor à esquerda, dados do cardápio à direita.
          className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8"
        >
          <section className="flex flex-col gap-4 rounded-3xl bg-(--bg-elevado) p-4 ring-1 ring-(--borda)">
            <Controller
              control={control}
              name="capa"
              render={({ field }) => (
                <CampoImagem rotulo="Capa" dica="Foto de abertura do cardápio" formato="paisagem" valor={field.value} onChange={field.onChange} onEnviando={contarEnvio} />
              )}
            />
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <CampoImagem rotulo="Logo" dica="Quadrado" formato="quadrado" valor={field.value} onChange={field.onChange} onEnviando={contarEnvio} />
              )}
            />
          </section>

          <section className="flex flex-col gap-4 lg:row-span-2">
            <InputField label="Nome do restaurante" erro={errors.nome?.message} {...register("nome")} />
            <InputField
              label="Endereço do cardápio"
              dica={`O cliente acessa em /${watch("slug") || "endereco"}`}
              erro={errors.slug?.message}
              autoCapitalize="none"
              {...register("slug", { onChange: () => setSlugEditado(true) })}
            />
            <TextareaField label="Descrição" erro={errors.descricao?.message} {...register("descricao")} />
            <Controller
              control={control}
              name="corDestaque"
              render={({ field }) => <CampoCor cor={field.value} onChange={field.onChange} erro={errors.corDestaque?.message} />}
            />
          </section>

          <section className="flex flex-col gap-4 rounded-3xl bg-(--bg-elevado) p-4 ring-1 ring-(--borda)">
            <h2 className="font-display font-semibold">Gestor do restaurante</h2>
            {id ? (
              <p className="text-sm text-(--texto-suave)">
                {restaurante?.gestorNome} · {restaurante?.gestorEmail}
              </p>
            ) : (
              <>
                <InputField label="Nome" erro={errors.gestorNome?.message} {...register("gestorNome")} />
                <InputField label="E-mail de login" type="email" autoComplete="off" erro={errors.gestorEmail?.message} {...register("gestorEmail")} />
              </>
            )}
            <InputField
              label={id ? "Nova senha (opcional)" : "Senha inicial"}
              type="password"
              autoComplete="new-password"
              dica="Mínimo de 8 caracteres"
              erro={errors.gestorSenha?.message}
              {...register("gestorSenha")}
            />
          </section>

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
              loading={criar.isPending || atualizar.isPending}
              disabled={enviando > 0}
              icone={<FloppyDiskIcon size={18} weight="bold" aria-hidden />}
              className="py-3 sm:min-w-44"
            >
              {enviando > 0 ? "Aguardando envio…" : "Salvar"}
            </Botao>
          </div>
        </motion.form>
      )}

      <ConfirmacaoSheet
        isOpen={confirmarExclusao}
        titulo="Excluir este restaurante?"
        descricao="Apaga o restaurante, a conta do gestor, todo o cardápio e as métricas. Para só tirar do ar, desative em vez de excluir."
        rotuloConfirmar="Excluir definitivamente"
        perigo
        loading={excluir.isPending}
        onConfirm={aoExcluir}
        onClose={() => setConfirmarExclusao(false)}
      />
    </PainelShell>
  );
}
