/**
 * @description Para onde o feed vai quando o cliente desliza além da última (ou antes da primeira) foto do prato.
 * Base = categoria selecionada; em "Tudo", a primeira categoria do prato na ordem do cardápio.
 */
import type { CategoriaPublica, ItemPublico } from "../types/cardapioPublico";

/** `null` = "Tudo"; `undefined` = não há para onde ir. */
export type Destino = CategoriaPublica | null | undefined;

export function categoriaVizinha(
  categorias: CategoriaPublica[],
  selecionada: string | null,
  item: ItemPublico,
  direcao: 1 | -1,
): Destino {
  const base = selecionada
    ? categorias.findIndex((c) => c.id === selecionada)
    : categorias.findIndex((c) => item.categoriaIds.includes(c.id));

  if (direcao === 1) {
    // Prato sem categoria em "Tudo": segue para a primeira.
    return categorias[base + 1];
  }
  if (base > 0) return categorias[base - 1];
  // Antes da primeira categoria só existe o "Tudo", e só faz sentido se há filtro.
  return base === 0 && selecionada ? null : undefined;
}
