/**
 * @description Busca da aba Explorar: o que casa pelo nome vem primeiro, depois pela categoria e por último
 * pelos ingredientes. Dentro de cada camada vale a ordem do cardápio. Sem acento e sem caixa.
 */
import type { CategoriaPublica, ItemPublico } from "../types/cardapioPublico";

export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function buscarItens(itens: ItemPublico[], categorias: CategoriaPublica[], termo: string): ItemPublico[] {
  const busca = normalizar(termo);
  if (!busca) return itens;

  const nomeCategoria = new Map(categorias.map((c) => [c.id, normalizar(c.nome)]));
  const camada = (item: ItemPublico): number => {
    if (normalizar(item.nome).includes(busca)) return 0;
    if (item.categoriaIds.some((id) => nomeCategoria.get(id)?.includes(busca))) return 1;
    if (item.ingredientes.some((ingrediente) => normalizar(ingrediente).includes(busca))) return 2;
    return -1;
  };

  // sort é estável: empates mantêm a ordem do cardápio.
  return itens
    .map((item) => ({ item, camada: camada(item) }))
    .filter(({ camada }) => camada >= 0)
    .sort((a, b) => a.camada - b.camada)
    .map(({ item }) => item);
}
