import { describe, expect, it } from "vitest";

import type { ItemPublico } from "@/modules/cardapioPublico/types/cardapioPublico";
import { categoriaVizinha } from "@/modules/cardapioPublico/utils/categoriaVizinha";

const pratos = { id: "p", nome: "Pratos", ordem: 0 };
const bebidas = { id: "b", nome: "Bebidas", ordem: 1 };
const doces = { id: "d", nome: "Sobremesas", ordem: 2 };
const categorias = [pratos, bebidas, doces];
const item = (categoriaIds: string[]): ItemPublico => ({
  id: "i", nome: "x", valor: 1, categoriaIds, ingredientes: [], especificacoes: [], imagens: [],
});

describe("categoriaVizinha", () => {
  it("com filtro, anda na ordem das categorias e volta ao Tudo antes da primeira", () => {
    expect(categoriaVizinha(categorias, "b", item(["b"]), 1)).toBe(doces);
    expect(categoriaVizinha(categorias, "b", item(["b"]), -1)).toBe(pratos);
    expect(categoriaVizinha(categorias, "p", item(["p"]), -1)).toBeNull();
    expect(categoriaVizinha(categorias, "d", item(["d"]), 1)).toBeUndefined();
  });

  it("em Tudo, parte da primeira categoria do prato (na ordem do cardápio)", () => {
    // Prato em Sobremesas e Pratos: a base é Pratos.
    expect(categoriaVizinha(categorias, null, item(["d", "p"]), 1)).toBe(bebidas);
    expect(categoriaVizinha(categorias, null, item(["b"]), -1)).toBe(pratos);
    // Em Tudo não há "voltar" antes da primeira.
    expect(categoriaVizinha(categorias, null, item(["p"]), -1)).toBeUndefined();
  });

  it("prato sem categoria em Tudo segue para a primeira", () => {
    expect(categoriaVizinha(categorias, null, item([]), 1)).toBe(pratos);
    expect(categoriaVizinha(categorias, null, item([]), -1)).toBeUndefined();
  });
});
