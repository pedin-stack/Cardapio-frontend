import { describe, expect, it } from "vitest";

import type { ItemPublico } from "@/modules/cardapioPublico/types/cardapioPublico";
import { buscarItens } from "@/modules/cardapioPublico/utils/buscaExplorar";

const categorias = [
  { id: "c1", nome: "Pratos", ordem: 0 },
  { id: "c2", nome: "Bebidas", ordem: 1 },
];
const item = (id: string, nome: string, categoriaIds: string[], ingredientes: string[]): ItemPublico => ({
  id, nome, valor: 10, categoriaIds, ingredientes, especificacoes: [], imagens: [],
});
const itens = [
  item("1", "Limonada com Hortelã", ["c2"], ["Limão-siciliano", "Hortelã"]),
  item("2", "Caipirinha", ["c2"], ["Cachaça", "Limão-taiti"]),
  item("3", "Café Espresso", ["c2"], ["Café"]),
  item("4", "Salmão Grelhado", ["c1"], ["Salmão", "Limão-siciliano"]),
  item("5", "Bebida da Casa", ["c1"], []),
];
const ids = (lista: ItemPublico[]) => lista.map((i) => i.id);

describe("buscarItens", () => {
  it("nome vem antes de categoria, que vem antes de ingrediente", () => {
    // "bebida": nome do item 5, categoria dos itens 1-3.
    expect(ids(buscarItens(itens, categorias, "bebida"))).toEqual(["5", "1", "2", "3"]);
    // "lim": nome do 1, ingrediente do 2 e do 4 (na ordem do cardápio).
    expect(ids(buscarItens(itens, categorias, "lim"))).toEqual(["1", "2", "4"]);
  });

  it("ignora acentos e caixa nos dois lados", () => {
    expect(ids(buscarItens(itens, categorias, "  LIMÃO "))).toEqual(["1", "2", "4"]);
    expect(ids(buscarItens(itens, categorias, "salmao"))).toEqual(["4"]);
  });

  it("termo vazio devolve o cardápio inteiro; sem resultado devolve vazio", () => {
    expect(buscarItens(itens, categorias, " ")).toBe(itens);
    expect(buscarItens(itens, categorias, "pizza")).toEqual([]);
  });
});
