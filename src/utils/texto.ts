/** Sem acento, sem caixa e sem espaço nas pontas: a forma de comparar texto nas buscas. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
