/**
 * @description Espelho de `CardapioPublicoResponseDTO` e filhos (backend: modules/cardapio/publico).
 */
export type RestaurantePublico = {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  logoUrl?: string;
  capaUrl?: string;
};

export type CategoriaPublica = {
  id: string;
  nome: string;
  ordem: number;
};

export type ItemPublico = {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  categoriaIds: string[];
  ingredientes: string[];
  imagens: string[];
  /** Playlist HLS mestre; ausente enquanto o vídeo não estiver PRONTO. */
  videoHlsUrl?: string;
  videoPosterUrl?: string;
};

export type CardapioPublico = {
  restaurante: RestaurantePublico;
  categorias: CategoriaPublica[];
  itens: ItemPublico[];
};

/** Espelho de `VisualizacoesRequestDTO.VisualizacaoItem`. */
export type VisualizacaoItem = {
  itemId: string;
  duracaoMs: number;
};
