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
  imagens: string[];
  videoCaminho?: string;
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
  tempoPorItem: { itemId: string; nome: string; visualizacoes: number; tempoTotalMs: number; tempoMedioMs: number }[];
  maisCurtidos: { itemId: string; nome: string; total: number }[];
  quasePedidos: { itemId: string; nome: string; total: number }[];
  /** diaSemana ISO: 1 = segunda … 7 = domingo. */
  curtidasPorHorario: { diaSemana: number; hora: number; total: number }[];
};
