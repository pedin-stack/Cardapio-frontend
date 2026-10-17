/**
 * @description Espelha `ItemCardapioRequestDTO` (limites citados do DTO do backend).
 */
import { z } from "zod";

export const MAXIMO_IMAGENS = 8; // @Size(max = 8) em imagens

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
