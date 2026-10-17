/**
 * @description Identificador anônimo e estável do navegador (UUID v4). O backend usa como
 * `X-Device-ID`: dono das curtidas, das visualizações e chave do rate limit.
 */

const CHAVE = "cardapio-dispositivo-id";

/** UUID v4. `crypto.randomUUID` só existe em contexto seguro; testar o cardápio pelo IP da rede local é http. */
export function gerarUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

let emMemoria: string | undefined;

export function obterDispositivoId(): string {
  // localStorage lança SecurityError com storage bloqueado (modo privado antigo, iframe de terceiros):
  // cai para um id em memória, válido até recarregar a página.
  try {
    let id = localStorage.getItem(CHAVE);
    if (!id) {
      id = gerarUuid();
      localStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    emMemoria ??= gerarUuid();
    return emMemoria;
  }
}
