/**
 * @description Espelha `LoginRequestDTO` (@Email, @Size(max = 100) no e-mail; @Size(max = 72) na senha).
 */
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").max(100, "O e-mail não pode exceder 100 caracteres."),
  senha: z.string().min(1, "A senha é obrigatória.").max(72, "A senha não pode exceder 72 caracteres."),
});

export type LoginForm = z.infer<typeof loginSchema>;
