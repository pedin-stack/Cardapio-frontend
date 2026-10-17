/**
 * @description Decide, pelo status, se a mensagem do backend pode chegar ao usuário (blueprint §5.4):
 * 4xx é conversa com o usuário; 5xx e falha de rede são incidente (texto genérico).
 */
import { isAxiosError } from "axios";

export const MENSAGEM_ERRO_SERVIDOR = "O servidor está indisponível no momento. Tente novamente em instantes.";
export const MENSAGEM_ERRO_REDE = "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

export function mensagemSeguraDeErro(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return err instanceof Error && err.message ? err.message : fallback;
  if (!err.response) return MENSAGEM_ERRO_REDE;
  const { status, data } = err.response;
  if (status >= 500) return MENSAGEM_ERRO_SERVIDOR;
  if (typeof data === "object" && data !== null) {
    const { message } = data as { message?: unknown };
    if (typeof message === "string" && message.trim()) return message;
    // 422 do BindingResult: mapa campo → mensagem; mostra a primeira.
    const primeira = Object.values(data).find((valor) => typeof valor === "string");
    if (status === 422 && typeof primeira === "string") return primeira;
  }
  return fallback;
}

export function statusDoErro(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}
