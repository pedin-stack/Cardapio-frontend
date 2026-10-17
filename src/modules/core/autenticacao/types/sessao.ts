/**
 * @description Espelho de `UsuarioSessaoResponseDTO` (login e meus-dados).
 */
import type { Permissao } from "@/types/permissoes";

export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  restauranteId?: string;
  restauranteNome?: string;
  restauranteSlug?: string;
  permissoes: Permissao[];
  /** Só no login. */
  expiraEm?: string;
};

/** Espelho de `LoginRequestDTO`. */
export type LoginPayload = {
  email: string;
  senha: string;
};
