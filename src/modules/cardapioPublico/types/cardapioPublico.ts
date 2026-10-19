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
  /** Hex `#rrggbb`; ausente = cor padrão. */
  corDestaque?: string;
  /** Logo horizontal do cabeçalho (a `logoUrl` quadrada fica na capa). */
  logoCabecalhoUrl?: string;
  /** Vídeo de fundo da capa (HLS); ausente enquanto não estiver PRONTO. */
  videoHlsUrl?: string;
  videoPosterUrl?: string;
  /** DDD + número, só dígitos. */
  whatsapp?: string;
  /** Usuário, sem o @. */
  instagram?: string;
};

/** Adicional pago que o cliente soma ao item (`AdicionalResponseDTO` sem os itens). */
export type Adicional = {
  id: string;
  nome: string;
  valor: number;
};

/** Grupo de opção única (`Especificacao` do back): o cliente escolhe uma opção. */
export type Especificacao = {
  nome: string;
  opcoes: string[];
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
  especificacoes: Especificacao[];
  imagens: string[];
  /** Playlist HLS mestre; ausente enquanto o vídeo não estiver PRONTO. */
  videoHlsUrl?: string;
  videoPosterUrl?: string;
  adicionais: Adicional[];
  /** Média das estrelas com uma casa; ausente sem avaliações. */
  avaliacaoMedia?: number;
  avaliacoes: number;
  comentarios: number;
};

export type CardapioPublico = {
  restaurante: RestaurantePublico;
  categorias: CategoriaPublica[];
  itens: ItemPublico[];
  /** "Mais pedidos": ids dos mais curtidos, do mais curtido para o menos (vazio = sem curtidas ainda). */
  maisPedidos: string[];
};

/** Espelho de `VisualizacoesRequestDTO.VisualizacaoItem`. */
export type VisualizacaoItem = {
  itemId: string;
  duracaoMs: number;
};

/** `IdentificacaoClienteRequestDTO`: telefone e CPF só com dígitos. */
export type IdentificacaoCliente = {
  nome: string;
  telefone: string;
  cpf: string;
};

/** `ClienteSessaoResponseDTO`. */
export type ClienteSessao = {
  token: string;
  nome: string;
};

/** `ComentarioResponseDTO`: só o primeiro nome do autor. */
export type Comentario = {
  id: string;
  autor: string;
  texto: string;
  criadoEm: string;
};
