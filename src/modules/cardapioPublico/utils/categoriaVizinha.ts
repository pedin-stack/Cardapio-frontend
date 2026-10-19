/**
 * @description Para onde o feed pula quando o cliente desliza além da última (ou antes da primeira) foto do prato:
 * o primeiro prato da categoria seguinte (ou da anterior) na ordem do cardápio.
 */
import type { CategoriaPublica } from "../types/cardapioPublico";

/** `undefined` = não há para onde ir (pontas, ou restaurante sem categorias). */
export function categoriaVizinha(categorias: CategoriaPublica[], atual: string | null, direcao: 1 | -1): CategoriaPublica | undefined {
  const indice = categorias.findIndex((c) => c.id === atual);
  return indice < 0 ? undefined : categorias[indice + direcao];
}
