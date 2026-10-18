/**
 * @description Espelhos dos DTOs de restaurante (backend: modules/core/restaurante).
 */

/** `RestauranteResponseDTO`. `gestor*` só no detalhe/cadastro. */
export type Restaurante = {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  logoPath?: string;
  logoUrl?: string;
  capaPath?: string;
  capaUrl?: string;
  /** Hex `#rrggbb`; ausente = cor padrão. */
  corDestaque?: string;
  ativo: boolean;
  criadoEm: string;
  gestorNome?: string;
  gestorEmail?: string;
};

/** `RestauranteRequestDTO` (cadastro com o gestor). */
export type RestaurantePayload = {
  nome: string;
  slug: string;
  descricao?: string;
  logoPath?: string;
  capaPath?: string;
  corDestaque?: string;
  gestorNome: string;
  gestorEmail: string;
  gestorSenha: string;
};

/** `RestauranteAtualizarRequestDTO` (gestorSenha opcional redefine a senha). */
export type RestauranteAtualizarPayload = {
  nome: string;
  slug: string;
  descricao?: string;
  logoPath?: string;
  capaPath?: string;
  corDestaque?: string;
  gestorSenha?: string;
};
