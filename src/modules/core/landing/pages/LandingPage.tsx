/**
 * @description Landing para restaurantes interessados: o que o cliente vê, o que o gestor ganha e o cardápio de
 * demonstração (Casa Jatobá, fictícia) rodando ao vivo numa moldura de celular no PC. As métricas usam os gráficos
 * reais do painel com dados de exemplo.
 */
import { useEffect, useState, type ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ChatCircleDotsIcon,
  ClockIcon,
  DeviceMobileIcon,
  FireIcon,
  GridFourIcon,
  HeartBreakIcon,
  HeartIcon,
  ImageIcon,
  ImagesIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  PaletteIcon,
  PlayCircleIcon,
  PlusCircleIcon,
  QrCodeIcon,
  ShareFatIcon,
  SignInIcon,
  SlidersHorizontalIcon,
  StarIcon,
  StorefrontIcon,
  TagIcon,
  VideoCameraIcon,
  WhatsappLogoIcon,
  type Icon,
} from "@phosphor-icons/react";

import { BarrasRanking, type LinhaRanking } from "@/modules/gestaoCardapio/components/BarrasRanking";
import { MapaCalorHorarios } from "@/modules/gestaoCardapio/components/MapaCalorHorarios";

const SLUG_DEMO = "casa-jatoba";
const URL_DEMO = `/${SLUG_DEMO}`;

type Recurso = { Icone: Icon; titulo: string; texto: string };

const DESTAQUES = ["Sem app para baixar", "Sem cadastro obrigatório", "Abre pelo link ou QR", "Vídeo sem espera"];

const PARA_CLIENTE: Recurso[] = [
  {
    Icone: PlayCircleIcon,
    titulo: "Um prato por tela",
    texto: "Fotos e vídeos de ponta a ponta, rolando como nos Reels. O próximo vídeo já vem carregado.",
  },
  {
    Icone: HeartIcon,
    titulo: "Curtir é pedir",
    texto: "Um toque no coração (ou dois na foto) e o prato vai para Curtidos, que vira a lista do pedido.",
  },
  { Icone: FireIcon, titulo: "Mais pedidos", texto: "Os pratos mais curtidos aparecem primeiro, numa vitrine que se monta sozinha." },
  {
    Icone: MagnifyingGlassIcon,
    titulo: "Explorar e buscar",
    texto: "Mosaico com o cardápio inteiro e busca por nome, categoria ou ingrediente, com ou sem acento.",
  },
  {
    Icone: SlidersHorizontalIcon,
    titulo: "Adicionais e especificações",
    texto: "Ponto da carne, tamanho, extras: o cliente escolhe no próprio prato, com a quantidade.",
  },
  {
    Icone: StarIcon,
    titulo: "Comentários e avaliações",
    texto: "Quem se identifica comenta e dá estrelas. Os comentários são públicos e o restaurante modera.",
  },
  { Icone: ShareFatIcon, titulo: "Compartilhar", texto: "Manda o prato para quem vai dividir a mesa, direto do card." },
  { Icone: ListBulletsIcon, titulo: "Também em lista", texto: "Prefere o jeito clássico? O cardápio vira lista, com o vídeo rodando no topo." },
];

const METRICAS: Recurso[] = [
  { Icone: HeartIcon, titulo: "Mais curtidos", texto: "Os pedidos de verdade, em ranking por categoria e período." },
  { Icone: HeartBreakIcon, titulo: "Quase pedidos", texto: "Curtiu e desistiu: sinal de preço, foto ou descrição para rever." },
  { Icone: ClockIcon, titulo: "Tempo de atenção", texto: "Quanto tempo cada prato segura o cliente na tela." },
  { Icone: GridFourIcon, titulo: "Dias e horários", texto: "Mapa de calor dia × hora: quando o cardápio mais vende." },
];

const MARCA: Recurso[] = [
  { Icone: PaletteIcon, titulo: "Sua cor", texto: "Botões, destaques e gradientes do cardápio com a cor do restaurante." },
  { Icone: ImageIcon, titulo: "Seu logo", texto: "No cabeçalho do cardápio, do primeiro ao último prato." },
  { Icone: VideoCameraIcon, titulo: "Vídeo na capa", texto: "O ambiente da casa rodando na abertura, antes do primeiro prato." },
  { Icone: WhatsappLogoIcon, titulo: "WhatsApp e Instagram", texto: "Atalhos para o cliente falar com você e seguir a casa." },
];

const PAINEL: Recurso[] = [
  { Icone: ImagesIcon, titulo: "Itens completos", texto: "Até 8 fotos e 1 vídeo por prato, com preço, ingredientes e especificações." },
  { Icone: TagIcon, titulo: "Categorias", texto: "Organize e reordene as seções do cardápio quando quiser." },
  { Icone: PlusCircleIcon, titulo: "Adicionais", texto: "Cadastre uma vez e ofereça em quantos pratos precisar." },
  { Icone: ChatCircleDotsIcon, titulo: "Moderação", texto: "Leia os comentários de cada prato e apague o que não cabe." },
];

const PASSOS: Recurso[] = [
  { Icone: StorefrontIcon, titulo: "Cadastramos seu restaurante", texto: "Com endereço próprio e o acesso do gestor ao painel." },
  { Icone: DeviceMobileIcon, titulo: "Você monta o cardápio", texto: "Pelo celular: fotos, vídeos, preços, categorias e a cara da sua marca." },
  { Icone: QrCodeIcon, titulo: "O cliente abre e pede", texto: "Pelo link ou pelo QR na mesa, sem baixar nada." },
];

// Exemplo ilustrativo: picos no almoço e no jantar, mais fortes de sexta a domingo.
const HORARIOS_EXEMPLO = Array.from({ length: 7 * 24 }, (_, i) => {
  const diaSemana = Math.floor(i / 24) + 1;
  const hora = i % 24;
  const pico = (centro: number, altura: number) => altura * Math.exp(-((hora - centro) ** 2) / 3);
  return { diaSemana, hora, total: Math.round((pico(12.5, 14) + pico(20, 22)) * (diaSemana >= 5 ? 1.4 : 1)) };
});

const RANKING_EXEMPLO: LinhaRanking[] = [
  { id: "1", rotulo: "Picanha na chapa", valor: 184, valorFormatado: "184" },
  { id: "2", rotulo: "Caipirinha de limão", valor: 139, valorFormatado: "139" },
  { id: "3", rotulo: "Moqueca de peixe", valor: 97, valorFormatado: "97" },
  { id: "4", rotulo: "Pudim de leite", valor: 62, valorFormatado: "62" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const surgir = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: EASE } }),
};

const entrada = {
  oculto: { opacity: 0, y: 28, filter: "blur(8px)" },
  visivel: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.1 + i * 0.12, duration: 0.8, ease: EASE } }),
};

const naTela = { initial: "oculto", whileInView: "visivel", viewport: { once: true, margin: "-60px" } } as const;

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
        <title>Conheça · Cardápio</title>
        <meta
          name="description"
          content="O cardápio que se navega como uma rede social: pratos em vídeo, curtir para pedir e métricas do que o cliente mais quer."
        />
      </Head>

      <header className="sticky top-0 z-30 border-b border-white/5 bg-(--bg)/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <Link href="/conheca" className="font-display text-xl font-bold texto-gradiente">
            Cardápio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full vidro-claro px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
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
            className="absolute -top-32 -left-24 size-96 rounded-full bg-(--destaque)/25 blur-[110px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute top-1/3 -right-24 size-80 rounded-full bg-(--destaque-2)/15 blur-[110px]"
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
                className="inline-flex items-center gap-2 rounded-full bg-(--destaque-suave) px-3 py-1 text-xs font-semibold text-(--destaque-2) ring-1 ring-(--destaque)/30"
              >
                Cardápio digital para restaurantes
              </motion.p>
              <motion.h1
                custom={1}
                variants={entrada}
                initial="oculto"
                animate="visivel"
                className="mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance texto-gradiente sm:text-6xl"
              >
                O cardápio que se navega como uma rede social
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
                  className="group inline-flex items-center gap-2 rounded-full gradiente-destaque px-6 py-3 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,107,74,0.8)]"
                >
                  Ver demonstração
                  <ArrowSquareOutIcon size={18} weight="bold" className="transition group-hover:translate-x-0.5" aria-hidden />
                </a>
                <a
                  href="#recursos"
                  className="group inline-flex items-center gap-2 rounded-full vidro-claro px-6 py-3 font-semibold transition hover:bg-white/15"
                >
                  Ver recursos
                  <ArrowRightIcon size={18} weight="bold" className="transition group-hover:translate-x-1" aria-hidden />
                </a>
              </motion.div>
              <motion.ul custom={4} variants={entrada} initial="oculto" animate="visivel" className="mt-10 flex flex-wrap gap-2">
                {DESTAQUES.map((destaque) => (
                  <li key={destaque} className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-(--texto-suave) ring-1 ring-white/8">
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
              <div aria-hidden className="absolute -inset-8 rounded-full bg-(--destaque)/20 blur-[80px]" />
              <div className="relative h-[min(780px,calc(100svh-8rem))] w-[370px] rounded-[3rem] bg-black p-2.5 shadow-[0_40px_120px_-30px_rgba(255,107,74,0.6)] ring-1 ring-(--borda-forte)">
                <div className="size-full overflow-hidden rounded-[2.5rem] bg-(--bg-elevado)">
                  {telaGrande && <iframe src={URL_DEMO} title="Cardápio de demonstração da Casa Jatobá" loading="lazy" className="size-full border-0" />}
                </div>
              </div>
              <p className="relative mt-4 text-center text-xs text-(--texto-fraco)">Ao vivo: role, curta e explore.</p>
            </motion.div>
          </div>
        </section>

        <Secao
          id="recursos"
          rotulo="Para quem pede"
          titulo="Escolher o prato fica tão natural quanto rolar o feed"
          texto="Nada de PDF ou lista sem foto: o cliente vê o prato de verdade e decide com vontade."
        >
          <GradeRecursos recursos={PARA_CLIENTE} />
        </Secao>

        <Secao
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
              className="flex flex-col gap-6 rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/8"
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
        </Secao>

        <Secao
          rotulo="Sua marca"
          titulo="Um cardápio com a cara da sua casa"
          texto="Cor, logo, vídeo de abertura e redes sociais: o cliente reconhece o restaurante em cada tela."
        >
          <GradeRecursos recursos={MARCA} />
        </Secao>

        <Secao
          rotulo="Painel do gestor"
          titulo="Atualize o cardápio em minutos, pelo celular"
          texto="Mudou o preço, entrou um prato novo, acabou um item? Você mesmo atualiza, sem depender de ninguém."
        >
          <GradeRecursos recursos={PAINEL} />
        </Secao>

        <Secao rotulo="Como funciona" titulo="Três passos até o primeiro pedido" texto="Sem instalação, sem maquininha nova, sem treinamento longo.">
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {PASSOS.map(({ Icone, titulo, texto }, i) => (
              <motion.li key={titulo} {...naTela} custom={i} variants={surgir} className="relative rounded-3xl vidro p-6">
                <span className="font-display text-5xl font-bold text-white/10" aria-hidden>
                  {i + 1}
                </span>
                <Icone size={26} weight="duotone" className="absolute top-6 right-6 text-(--destaque)" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold">{titulo}</h3>
                <p className="mt-1.5 text-sm text-(--texto-suave)">{texto}</p>
              </motion.li>
            ))}
          </ol>
        </Secao>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <motion.div
            {...naTela}
            custom={0}
            variants={surgir}
            className="relative overflow-hidden rounded-[2rem] vidro px-6 py-14 text-center sm:px-12"
          >
            <div aria-hidden className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-(--destaque)/30 blur-[100px]" />
            <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance texto-gradiente sm:text-4xl">
              Veja funcionando
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-(--texto-suave)">
              Abra o cardápio da Casa Jatobá, um restaurante de demonstração, e navegue como seu cliente vai navegar.
            </p>
            <a
              href={URL_DEMO}
              target="_blank"
              rel="noopener"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full gradiente-destaque px-7 py-3.5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,107,74,0.8)]"
            >
              Abrir demonstração
              <ArrowSquareOutIcon size={18} weight="bold" aria-hidden />
            </a>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-sm text-(--texto-fraco)">
          <span>
            <span className="font-display font-semibold texto-gradiente">Cardápio</span>: o cardápio que se navega como uma rede social.
          </span>
          <Link href="/login" className="transition hover:text-(--texto)">
            Entrar no painel
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Secao({ id, rotulo, titulo, texto, children }: { id?: string; rotulo: string; titulo: string; texto: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
      <motion.div {...naTela} custom={0} variants={surgir} className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-(--destaque) uppercase">{rotulo}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{titulo}</h2>
        <p className="mt-4 text-(--texto-suave)">{texto}</p>
      </motion.div>
      {children}
    </section>
  );
}

function GradeRecursos({
  recursos,
  colunas = "sm:grid-cols-2 lg:grid-cols-4",
  semMargem,
}: {
  recursos: Recurso[];
  colunas?: string;
  semMargem?: boolean;
}) {
  return (
    <ul className={`grid gap-4 ${colunas} ${semMargem ? "" : "mt-10"}`}>
      {recursos.map(({ Icone, titulo, texto }, i) => (
        <motion.li key={titulo} {...naTela} custom={i % 4} variants={surgir} className="rounded-3xl vidro p-5">
          <div className="grid size-11 place-items-center rounded-2xl bg-(--destaque-suave)">
            <Icone size={22} weight="duotone" className="text-(--destaque)" aria-hidden />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{titulo}</h3>
          <p className="mt-1.5 text-sm text-(--texto-suave)">{texto}</p>
        </motion.li>
      ))}
    </ul>
  );
}
