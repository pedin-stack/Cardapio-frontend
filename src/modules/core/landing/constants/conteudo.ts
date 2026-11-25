/**
 * @description Textos e dados de exemplo da landing.
 */
import {
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
  SlidersHorizontalIcon,
  StarIcon,
  StorefrontIcon,
  TagIcon,
  VideoCameraIcon,
  WhatsappLogoIcon,
  type Icon,
} from "@phosphor-icons/react";

import type { LinhaRanking } from "@/components/graficos/BarrasRanking";

export type Recurso = { Icone: Icon; titulo: string; texto: string };

export const DESTAQUES = ["Sem app para baixar", "Sem cadastro obrigatório", "Abre pelo link ou QR", "Vídeo sem espera"];

export const PARA_CLIENTE: Recurso[] = [
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

export const METRICAS: Recurso[] = [
  { Icone: HeartIcon, titulo: "Mais curtidos", texto: "Os pedidos de verdade, em ranking por categoria e período." },
  { Icone: HeartBreakIcon, titulo: "Quase pedidos", texto: "Curtiu e desistiu: sinal de preço, foto ou descrição para rever." },
  { Icone: ClockIcon, titulo: "Tempo de atenção", texto: "Quanto tempo cada prato segura o cliente na tela." },
  { Icone: GridFourIcon, titulo: "Dias e horários", texto: "Mapa de calor dia × hora: quando o cardápio mais vende." },
];

export const MARCA: Recurso[] = [
  { Icone: PaletteIcon, titulo: "Sua cor", texto: "Botões, destaques e gradientes do cardápio com a cor do restaurante." },
  { Icone: ImageIcon, titulo: "Seu logo", texto: "No cabeçalho do cardápio, do primeiro ao último prato." },
  { Icone: VideoCameraIcon, titulo: "Vídeo na capa", texto: "O ambiente da casa rodando na abertura, antes do primeiro prato." },
  { Icone: WhatsappLogoIcon, titulo: "WhatsApp e Instagram", texto: "Atalhos para o cliente falar com você e seguir a casa." },
];

export const PAINEL: Recurso[] = [
  { Icone: ImagesIcon, titulo: "Itens completos", texto: "Até 8 fotos e 1 vídeo por prato, com preço, ingredientes e especificações." },
  { Icone: TagIcon, titulo: "Categorias", texto: "Organize e reordene as seções do cardápio quando quiser." },
  { Icone: PlusCircleIcon, titulo: "Adicionais", texto: "Cadastre uma vez e ofereça em quantos pratos precisar." },
  { Icone: ChatCircleDotsIcon, titulo: "Moderação", texto: "Leia os comentários de cada prato e apague o que não cabe." },
];

export const PASSOS: Recurso[] = [
  { Icone: StorefrontIcon, titulo: "Cadastramos seu restaurante", texto: "Com endereço próprio e o acesso do gestor ao painel." },
  { Icone: DeviceMobileIcon, titulo: "Você monta o cardápio", texto: "Pelo celular: fotos, vídeos, preços, categorias e a cara da sua marca." },
  { Icone: QrCodeIcon, titulo: "O cliente abre e pede", texto: "Pelo link ou pelo QR na mesa, sem baixar nada." },
];

// Exemplo ilustrativo: picos no almoço e no jantar, mais fortes de sexta a domingo.
export const HORARIOS_EXEMPLO = Array.from({ length: 7 * 24 }, (_, i) => {
  const diaSemana = Math.floor(i / 24) + 1;
  const hora = i % 24;
  const pico = (centro: number, altura: number) => altura * Math.exp(-((hora - centro) ** 2) / 3);
  return { diaSemana, hora, total: Math.round((pico(12.5, 14) + pico(20, 22)) * (diaSemana >= 5 ? 1.4 : 1)) };
});

export const RANKING_EXEMPLO: LinhaRanking[] = [
  { id: "1", rotulo: "Picanha na chapa", valor: 184, valorFormatado: "184" },
  { id: "2", rotulo: "Caipirinha de limão", valor: 139, valorFormatado: "139" },
  { id: "3", rotulo: "Moqueca de peixe", valor: 97, valorFormatado: "97" },
  { id: "4", rotulo: "Pudim de leite", valor: 62, valorFormatado: "62" },
];
