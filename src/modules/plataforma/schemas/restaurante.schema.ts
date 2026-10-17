/**
 * @description Espelha `RestauranteRequestDTO` / `RestauranteAtualizarRequestDTO` (limites citados do back).
 * No modo edição a senha do gestor é opcional (redefinição) e nome/e-mail do gestor não são enviados.
 */
import { z } from "zod";

/** Mesmo padrão de `RestauranteAtualizarRequestDTO.SLUG_REGEX`. */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const base = {
  nome: z.string().trim().min(1, "O nome do restaurante é obrigatório.").max(120, "Máximo de 120 caracteres."),
  slug: z.string().min(1, "O endereço do cardápio é obrigatório.").max(80, "Máximo de 80 caracteres.").regex(SLUG_REGEX, "Use só letras minúsculas, números e hífens."),
  descricao: z.string().max(500, "Máximo de 500 caracteres."),
  logo: z.object({ caminho: z.string(), url: z.string() }).nullable(),
  capa: z.object({ caminho: z.string(), url: z.string() }).nullable(),
};

export const restauranteCriarSchema = z.object({
  ...base,
  gestorNome: z.string().trim().min(1, "O nome do gestor é obrigatório.").max(100, "Máximo de 100 caracteres."),
  gestorEmail: z.email("Informe um e-mail válido.").max(100, "Máximo de 100 caracteres."),
  gestorSenha: z.string().min(8, "A senha deve ter entre 8 e 72 caracteres.").max(72, "A senha deve ter entre 8 e 72 caracteres."),
});

export const restauranteEditarSchema = z.object({
  ...base,
  gestorNome: z.string(),
  gestorEmail: z.string(),
  gestorSenha: z.union([z.literal(""), z.string().min(8, "A senha deve ter entre 8 e 72 caracteres.").max(72, "A senha deve ter entre 8 e 72 caracteres.")]),
});

export type RestauranteForm = z.infer<typeof restauranteCriarSchema>;
