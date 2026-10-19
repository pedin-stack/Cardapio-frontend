/**
 * @description Espelhos dos DTOs do gestor (backend: modules/cardapio/{categoria,itemcardapio,metrica}).
 */

/** `CategoriaResponseDTO`. */
export type Categoria = {
  id: string;
  nome: string;
  ordem: number;
};

/** `CategoriaRequestDTO`. */
export type CategoriaPayload = {
  nome: string;
  ordem?: number;
};

export type StatusVideo = "SEM_VIDEO" | "PROCESSANDO" | "PRONTO" | "ERRO";

/** `MidiaResponseDTO`. */
export type Midia = {
  caminho: string;
  url: string;
};

/** `Especificacao`: grupo de opção única que o cliente escolhe (ex.: ponto da carne). */
export type Especificacao = {
  nome: string;
  opcoes: string[];
};

/** `ItemCardapioResponseDTO`. */
export type ItemCardapio = {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  ativo: boolean;
  ordem: number;
  categorias: Categoria[];
  ingredientes: string[];
  especificacoes: Especificacao[];
  imagens: Midia[];
  video: {
    status: StatusVideo;
    caminhoOriginal?: string;
    hlsUrl?: string;
    posterUrl?: string;
  };
  atualizadoEm?: string;
};

/** `ItemCardapioRequestDTO` (o mesmo para criar e atualizar). */
export type ItemCardapioPayload = {
  nome: string;
  descricao?: string;
  valor: number;
  ativo: boolean;
  ordem: number;
  categoriaIds: string[];
  ingredientes: string[];
  especificacoes: Especificacao[];
  imagens: string[];
  videoCaminho?: string;
};

/** `RestauranteResponseDTO` (só o que o painel do gestor usa). */
export type MeuRestaurante = {
  id: string;
  nome: string;
  slug: string;
  logoUrl?: string;
  /** Hex `#rrggbb`; ausente = cor padrão. */
  corDestaque?: string;
  logoCabecalhoPath?: string;
  logoCabecalhoUrl?: string;
  /** Vídeo de fundo da capa (`VideoResponseDTO`). */
  video: ItemCardapio["video"];
  /** DDD + número, só dígitos. */
  whatsapp?: string;
  /** Usuário, sem o @. */
  instagram?: string;
};

/** `RestauranteAparenciaRequestDTO`: `null` remove o recurso (cor padrão, sem logo, sem vídeo, sem rede). */
export type AparenciaPayload = {
  corDestaque: string | null;
  logoCabecalhoPath: string | null;
  videoCaminho: string | null;
  whatsapp: string | null;
  instagram: string | null;
};

/** `AdicionalResponseDTO`. */
export type Adicional = {
  id: string;
  nome: string;
  valor: number;
  itemIds: string[];
};

/** `AdicionalRequestDTO` (o mesmo para criar e atualizar). */
export type AdicionalPayload = {
  nome: string;
  valor: number;
  itemIds: string[];
};

/** `ComentarioResponseDTO`: só o primeiro nome do autor. */
export type ComentarioItem = {
  id: string;
  autor: string;
  texto: string;
  criadoEm: string;
};

/** `MetricasResponseDTO`. */
export type Metricas = {
  inicio: string;
  fim: string;
  resumo: {
    visualizacoes: number;
    tempoTotalMs: number;
    curtidas: number;
    quasePedidos: number;
  };
  /** diaSemana ISO: 1 = segunda … 7 = domingo. */
  curtidasPorHorario: { diaSemana: number; hora: number; total: number }[];
};

export type TipoRanking = "CURTIDOS" | "QUASE_PEDIDOS" | "TEMPO";
export type OrdemRanking = "MAIOR" | "MENOR" | "NOME";

/** `RankingItemResponseDTO`. Em TEMPO, `valor` é o tempo médio (ms) e vêm visualizações e tempo total. */
export type RankingItem = {
  itemId: string;
  nome: string;
  valor: number;
  visualizacoes?: number;
  tempoTotalMs?: number;
};
