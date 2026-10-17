/**
 * @description Login do painel (gestor e super admin). Logado → vai direto para a área do perfil.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ForkKnifeIcon, SignInIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { rotaInicial, useAuth } from "@/auth/useAuth";
import { Botao } from "@/components/Botao";
import { InputField } from "@/components/inputs/InputField";

import { loginSchema, type LoginForm } from "../schemas/login.schema";

/** Só aceita voltar para rota interna (evita open redirect via ?redirect=https://…). */
function destinoSeguro(redirect: unknown): string | null {
  return typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
}

export default function LoginPage() {
  const router = useRouter();
  const { usuario, loading, login } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!loading && usuario) router.replace(destinoSeguro(router.query.redirect) ?? rotaInicial(usuario));
  }, [loading, usuario, router]);

  const aoEnviar = async (dados: LoginForm) => {
    setErro(null);
    try {
      const sessao = await login(dados);
      router.replace(destinoSeguro(router.query.redirect) ?? rotaInicial(sessao));
    } catch (e) {
      setErro(mensagemSeguraDeErro(e, "Não foi possível entrar."));
    }
  };

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-5">
      <Head>
        <title>Entrar · Cardápio</title>
      </Head>
      <motion.div
        aria-hidden
        className="absolute -top-20 -left-20 size-80 rounded-full bg-(--destaque)/30 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-24 bottom-0 size-80 rounded-full bg-(--destaque-2)/20 blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.form
        onSubmit={handleSubmit(aoEnviar)}
        noValidate
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-sm flex-col gap-5 rounded-[2rem] vidro p-7 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid size-14 place-items-center rounded-2xl gradiente-destaque">
            <ForkKnifeIcon size={28} weight="fill" aria-hidden />
          </div>
          <h1 className="font-display text-2xl font-bold">Entrar no painel</h1>
          <p className="text-sm text-(--texto-suave)">Gestores de restaurante e administradores da plataforma.</p>
        </div>

        <InputField label="E-mail" type="email" autoComplete="email" inputMode="email" erro={errors.email?.message} {...register("email")} />
        <InputField label="Senha" type="password" autoComplete="current-password" erro={errors.senha?.message} {...register("senha")} />

        {erro && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-(--perigo)/10 px-4 py-3 text-sm text-(--perigo) ring-1 ring-(--perigo)/30"
          >
            {erro}
          </motion.p>
        )}

        <Botao type="submit" loading={isSubmitting} icone={<SignInIcon size={18} weight="bold" aria-hidden />} className="py-3">
          Entrar
        </Botao>
      </motion.form>
    </main>
  );
}
