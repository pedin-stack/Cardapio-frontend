/**
 * @description Landing para restaurantes interessados: o que o cliente vê, o que o gestor ganha e o cardápio de
 * demonstração (Casa Jatobá, fictícia) rodando ao vivo numa moldura de celular no PC. As métricas usam os gráficos
 * reais do painel com dados de exemplo.
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  SignInIcon,
} from "@phosphor-icons/react";

import { BarrasRanking } from "@/components/graficos/BarrasRanking";
import { MapaCalorHorarios } from "@/components/graficos/MapaCalorHorarios";
import { Logo } from "@/components/Logo";

import { GradeRecursos } from "../components/GradeRecursos";
import { SecaoLanding } from "../components/SecaoLanding";
import { EASE, entrada, naTela, surgir } from "../constants/animacoes";
import { DESTAQUES, HORARIOS_EXEMPLO, MARCA, METRICAS, PAINEL, PARA_CLIENTE, PASSOS, RANKING_EXEMPLO } from "../constants/conteudo";

const SLUG_DEMO = "casa-jatoba";
const URL_DEMO = `/${SLUG_DEMO}`;

/** O iframe da demo só monta no PC: escondê-lo com CSS não impede o navegador de carregá-lo no celular. */
function useTelaGrande() {
  const [grande, setGrande] = useState(false);
  useEffect(() => {
    const consulta = matchMedia("(min-width: 1024px)");
    const atualizar = () => setGrande(consulta.matches);
    atualizar();
    consulta.addEventListener("change", atualizar);
    return () => consulta.removeEventListener("change", atualizar);
  }, []);
  return grande;
}

export default function LandingPage() {
  const telaGrande = useTelaGrande();
  const [metricasVistas, setMetricasVistas] = useState(false);

  return (
    <div className="relative overflow-x-clip">
      <Head>
        <title>Conheça · MenuClip</title>
        <meta
          name="description"
          content="O cardápio que se navega como uma rede social: pratos em vídeo, curtir para pedir e métricas do que o cliente mais quer."
        />
      </Head>

      <header className="sticky top-0 z-30 border-b border-(--borda) bg-(--bg)/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <Link href="/conheca">
            <Logo className="text-2xl" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full vidro-claro px-4 py-2 text-sm font-semibold transition hover:bg-(--superficie-max)"
          >
            <SignInIcon size={16} weight="bold" aria-hidden />
            Entrar no painel
          </Link>
        </div>
      </header>

      <main>
        <section className="relative">
          <motion.div
            aria-hidden
            className="absolute -top-32 -left-24 size-96 rounded-full bg-(--principal)/30 blur-[110px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute top-1/3 -right-24 size-80 rounded-full bg-(--destaque)/20 blur-[110px]"
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto flex max-w-6xl items-center gap-12 px-5 pt-16 pb-20 lg:min-h-[calc(100svh-4rem)] lg:py-12">
            <div className="flex-1">
              <motion.p
                custom={0}
                variants={entrada}
                initial="oculto"
                animate="visivel"
                className="inline-flex items-center gap-2 rounded-full bg-(--mc-menta) px-3 py-1 text-xs font-semibold text-(--principal-forte) ring-1 ring-(--principal)/40"
              >
                Cardápio digital para restaurantes
              </motion.p>
              <motion.h1
                custom={1}
                variants={entrada}
                initial="oculto"
                animate="visivel"
                className="mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
              >
                O cardápio que se navega como uma <span className="text-(--destaque-2)">rede social</span>
              </motion.h1>
              <motion.p custom={2} variants={entrada} initial="oculto" animate="visivel" className="mt-5 max-w-xl text-lg text-(--texto-suave)">
                Seus pratos em fotos e vídeos, um por tela. O cliente curte o que quer pedir e você descobre o que mais chama atenção,
                em que dia e em que horário.
              </motion.p>
              <motion.div custom={3} variants={entrada} initial="oculto" animate="visivel" className="mt-8 flex flex-wrap gap-3">
                <a
                  href={URL_DEMO}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-2 rounded-full gradiente-destaque px-6 py-3 font-semibold text-(--sobre-destaque) sombra-destaque"
                >
                  Ver demonstração
                  <ArrowSquareOutIcon size={18} weight="bold" className="transition group-hover:translate-x-0.5" aria-hidden />
                </a>
                <a
                  href="#recursos"
                  className="group inline-flex items-center gap-2 rounded-full vidro-claro px-6 py-3 font-semibold transition hover:bg-(--superficie-max)"
                >
                  Ver recursos
                  <ArrowRightIcon size={18} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
                </a>
              </motion.div>
              <motion.ul custom={4} variants={entrada} initial="oculto" animate="visivel" className="mt-10 flex flex-wrap gap-2">
                {DESTAQUES.map((destaque) => (
                  <li key={destaque} className="rounded-full bg-(--bg-elevado) px-3 py-1.5 text-xs text-(--texto-suave) ring-1 ring-(--borda)">
                    {destaque}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: EASE }}
              className="relative hidden shrink-0 lg:block"
            >
              <div aria-hidden className="absolute -inset-8 rounded-full bg-(--principal)/25 blur-[80px]" />
              <div className="relative h-[min(780px,calc(100svh-8rem))] w-[370px] rounded-[3rem] bg-black p-2.5 shadow-[0_40px_120px_-30px_color-mix(in_srgb,var(--mc-grafite)_60%,transparent)] ring-1 ring-(--borda-forte)">
                <div className="size-full overflow-hidden rounded-[2.5rem] bg-(--mc-grafite)">
                  {telaGrande && <iframe src={URL_DEMO} title="Cardápio de demonstração da Casa Jatobá" loading="lazy" className="size-full border-0" />}
                </div>
              </div>
              <p className="relative mt-4 text-center text-xs text-(--texto-fraco)">Ao vivo: role, curta e explore.</p>
            </motion.div>
          </div>
        </section>

        <SecaoLanding
          id="recursos"
          rotulo="Para quem pede"
          titulo="Escolher o prato fica tão natural quanto rolar o feed"
          texto="Nada de PDF ou lista sem foto: o cliente vê o prato de verdade e decide com vontade."
        >
          <GradeRecursos recursos={PARA_CLIENTE} />
        </SecaoLanding>

        <SecaoLanding
          rotulo="Para o restaurante"
          titulo="Saiba o que o cliente quer antes do pedido chegar"
          texto="Cada curtida é um pedido e cada segundo na tela vira dado. O painel mostra o que vende, o que quase vende e quando."
        >
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr] lg:items-start">
            <GradeRecursos recursos={METRICAS} colunas="sm:grid-cols-2" semMargem />
            <motion.div
              {...naTela}
              custom={1}
              variants={surgir}
              onViewportEnter={() => setMetricasVistas(true)}
              className="flex flex-col gap-6 rounded-3xl bg-(--bg-elevado) p-5 ring-1 ring-(--borda)"
            >
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-base font-semibold">Dias e horários mais pedidos</h3>
                  <span className="text-[11px] text-(--texto-fraco)">Exemplo ilustrativo</span>
                </div>
                <div className="mt-4">{metricasVistas && <MapaCalorHorarios dados={HORARIOS_EXEMPLO} />}</div>
              </div>
              <div>
                <h3 className="mb-4 font-display text-base font-semibold">Mais curtidos</h3>
                {metricasVistas && <BarrasRanking linhas={RANKING_EXEMPLO} cor="var(--destaque)" vazio="" />}
              </div>
            </motion.div>
          </div>
        </SecaoLanding>

        <SecaoLanding
          rotulo="Sua marca"
          titulo="Um cardápio com a cara da sua casa"
          texto="Cor, logo, vídeo de abertura e redes sociais: o cliente reconhece o restaurante em cada tela."
        >
          <GradeRecursos recursos={MARCA} />
        </SecaoLanding>

        <SecaoLanding
          rotulo="Painel do gestor"
          titulo="Atualize o cardápio em minutos, pelo celular"
          texto="Mudou o preço, entrou um prato novo, acabou um item? Você mesmo atualiza, sem depender de ninguém."
        >
          <GradeRecursos recursos={PAINEL} />
        </SecaoLanding>

        <SecaoLanding rotulo="Como funciona" titulo="Três passos até o primeiro pedido" texto="Sem instalação, sem maquininha nova, sem treinamento longo.">
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {PASSOS.map(({ Icone, titulo, texto }, i) => (
              <motion.li key={titulo} {...naTela} custom={i} variants={surgir} className="relative rounded-3xl vidro p-6">
                <span className="font-display text-5xl font-bold text-(--principal)/40" aria-hidden>
                  {i + 1}
                </span>
                <Icone size={26} weight="duotone" className="absolute top-6 right-6 text-(--principal-forte)" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold">{titulo}</h3>
                <p className="mt-1.5 text-sm text-(--texto-suave)">{texto}</p>
              </motion.li>
            ))}
          </ol>
        </SecaoLanding>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <motion.div
            {...naTela}
            custom={0}
            variants={surgir}
            className="relative overflow-hidden rounded-[2rem] bg-(--mc-grafite) px-6 py-14 text-center text-(--mc-gelo) sm:px-12"
          >
            <div aria-hidden className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-(--principal)/35 blur-[100px]" />
            <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Veja funcionando
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-(--mc-gelo)/75">
              Abra o cardápio da Casa Jatobá, um restaurante de demonstração, e navegue como seu cliente vai navegar.
            </p>
            <a
              href={URL_DEMO}
              target="_blank"
              rel="noopener"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full gradiente-destaque px-7 py-3.5 font-semibold text-(--sobre-destaque) sombra-destaque"
            >
              Abrir demonstração
              <ArrowSquareOutIcon size={18} weight="bold" aria-hidden />
            </a>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-(--borda)">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-sm text-(--texto-fraco)">
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <Logo className="text-base text-(--texto)" />o cardápio que se navega como uma rede social.
          </span>
          <Link href="/login" className="transition hover:text-(--texto)">
            Entrar no painel
          </Link>
        </div>
      </footer>
    </div>
  );
}
