/**
 * @description Identificador anônimo do navegador (UUID v4). O backend usa como `X-Device-ID`: dono das curtidas,
 * das visualizações e chave do rate limit. Ele e o que o cliente faz sem login valem 4 h desde a última mexida.
 */

const CHAVE = "cardapio-dispositivo-id";
const CHAVE_VALIDADE = "cardapio-validade";
const VALIDADE_MS = 4 * 60 * 60 * 1000;

/** Mexeu (curtiu, escolheu, seguiu sem login): o que ficou salvo vale por mais 4 h. */
export function renovarValidade() {
  try {
    localStorage.setItem(CHAVE_VALIDADE, String(Date.now() + VALIDADE_MS));
  } catch {
    // Storage bloqueado: nada fica salvo mesmo.
  }
}

/**
 * Vencidas as 4 h (ou sem validade, dado de antes dela existir), o navegador esquece toda chave `cardapio-*` — de
 * todos os restaurantes — menos a do cliente identificado, e ganha outro id: a volta no dia seguinte é outra visita.
 * Trocar o id importa: a curtida antiga segue ativa na API, então com o mesmo id curtir de novo não contaria e
 * descurtir desfaria o pedido da visita anterior.
 */
export function esquecerSeVencido() {
  try {
    if (Number(localStorage.getItem(CHAVE_VALIDADE)) > Date.now()) return;
    const chaves = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i) ?? "");
    for (const chave of chaves) {
      const identificado = chave.startsWith("cardapio-cliente:") && localStorage.getItem(chave) !== JSON.stringify("anonimo");
      if (chave.startsWith("cardapio-") && !identificado) localStorage.removeItem(chave);
    }
    renovarValidade();
  } catch {
    // Storage bloqueado: nada ficou salvo.
  }
}

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
