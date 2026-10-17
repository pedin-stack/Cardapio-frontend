/**
 * @description Algoritmo da "janela" de vídeos do feed (estilo TikTok), puro para ser testável.
 *
 * Com N cards no feed, só até 3 vídeos ficam vivos ao mesmo tempo:
 *  - o do card ativo TOCA (buffer de ~10 s, qualidade sobe pelo ABR);
 *  - o PRÓXIMO vídeo depois dele PRÉ-CARREGA só o 1º chunk (buffer de ~2 s = 1 segmento HLS, em 480p) —
 *    quando o cliente rolar, o primeiro quadro já está em memória e o play é instantâneo;
 *  - o vídeo ANTERIOR fica PAUSADO com o buffer (voltar uma tela não recarrega);
 *  - todos os outros são DESCARREGADOS (instância hls.js destruída: zero rede e memória).
 */
export type ModoVideo = "tocar" | "precarregar" | "pausado" | "descarregado";

/**
 * @param indicesComVideo índices (no feed) dos cards que têm vídeo pronto, em ordem crescente
 * @param indiceAtivo     card ≥ 60 % visível
 * @param pausarAtivo     true com o detalhe aberto, outra aba ativa ou página escondida
 * @returns modo de cada índice com vídeo (índices ausentes = descarregado)
 */
export function calcularModosVideo(
  indicesComVideo: readonly number[],
  indiceAtivo: number,
  pausarAtivo = false,
): Map<number, ModoVideo> {
  const modos = new Map<number, ModoVideo>(indicesComVideo.map((indice) => [indice, "descarregado"]));

  const proximo = indicesComVideo.find((indice) => indice > indiceAtivo);
  const anteriores = indicesComVideo.filter((indice) => indice < indiceAtivo);
  const anterior = anteriores[anteriores.length - 1];

  if (anterior !== undefined) modos.set(anterior, "pausado");
  if (proximo !== undefined) modos.set(proximo, "precarregar");
  if (modos.has(indiceAtivo)) modos.set(indiceAtivo, pausarAtivo ? "pausado" : "tocar");
  return modos;
}

/** Buffer à frente (segundos) por modo: no pré-carregamento, exatamente 1 chunk HLS de 2 s. */
export const BUFFER_SEGUNDOS: Record<ModoVideo, number> = {
  tocar: 10,
  precarregar: 2,
  pausado: 2,
  descarregado: 0,
};
