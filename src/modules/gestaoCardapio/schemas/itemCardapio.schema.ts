/**
 * @description Espelha `ItemCardapioRequestDTO` (limites citados do DTO do backend).
 */
import { z } from "zod";

export const MAXIMO_IMAGENS = 8; // @Size(max = 8) em imagens
export const MAXIMO_ESPECIFICACOES = 10; // @Size(max = 10) em especificacoes

export const itemCardapioSchema = z.object({
  // @NotBlank @Size(max = 120)
  nome: z.string().trim().min(1, "O nome do prato é obrigatório.").max(120, "O nome do prato não pode exceder 120 caracteres."),
  // @Size(max = 2000)
  descricao: z.string().max(2000, "A descrição não pode exceder 2000 caracteres."),
  // @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2)
  valor: z
    .number({ error: "Informe o valor." })
    .min(0, "O valor não pode ser negativo.")
    .max(99_999_999.99, "Valor muito alto.")
    .refine((v) => Number.isInteger(Math.round(v * 100)) && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Use no máximo 2 casas decimais."),
  ativo: z.boolean(),
  // @Min(0) @Max(9999)
  ordem: z.number({ error: "Informe a ordem." }).int().min(0).max(9999),
  // @Size(max = 20)
  categoriaIds: z.array(z.string()).max(20, "No máximo 20 categorias."),
  // @Size(max = 40), cada um @Size(max = 80)
  ingredientes: z.array(z.string().max(80)).max(40, "No máximo 40 ingredientes."),
  // @Size(max = 10); cada uma: nome @NotBlank @Size(max = 60), opcoes @Size(min = 2, max = 10) de @Size(max = 60)
  especificacoes: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Dê um nome à especificação.").max(60, "Máximo de 60 caracteres."),
        opcoes: z.array(z.string().max(60)).min(2, "Adicione pelo menos 2 opções.").max(10, "No máximo 10 opções."),
      }),
    )
    .max(MAXIMO_ESPECIFICACOES, "No máximo 10 especificações."),
  imagens: z.array(z.object({ caminho: z.string(), url: z.string() })).max(MAXIMO_IMAGENS, "Cada item pode ter no máximo 8 imagens."),
  video: z
    .object({
      caminho: z.string(),
      url: z.string().optional(),
      hlsUrl: z.string().optional(),
      posterUrl: z.string().optional(),
    })
    .nullable(),
});

export type ItemCardapioForm = z.infer<typeof itemCardapioSchema>;
