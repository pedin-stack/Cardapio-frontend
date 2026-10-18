/**
 * @description Para onde o feed vai quando o cliente desliza além da última (ou antes da primeira) foto do prato:
 * a categoria seguinte (ou a anterior) na ordem do cardápio. O feed sempre mostra uma categoria; o cardápio
 * inteiro fica na aba Explorar.
 */
import type { CategoriaPublica } from "../types/cardapioPublico";

/** `undefined` = não há para onde ir (pontas, ou restaurante sem categorias). */
export function categoriaVizinha(categorias: CategoriaPublica[], atual: string | null, direcao: 1 | -1): CategoriaPublica | undefined {
  const indice = categorias.findIndex((c) => c.id === atual);
  return indice < 0 ? undefined : categorias[indice + direcao];
}
