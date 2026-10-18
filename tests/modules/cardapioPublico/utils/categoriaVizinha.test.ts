import { describe, expect, it } from "vitest";

import { categoriaVizinha } from "@/modules/cardapioPublico/utils/categoriaVizinha";

const pratos = { id: "p", nome: "Pratos", ordem: 0 };
const bebidas = { id: "b", nome: "Bebidas", ordem: 1 };
const doces = { id: "d", nome: "Sobremesas", ordem: 2 };
const categorias = [pratos, bebidas, doces];

describe("categoriaVizinha", () => {
  it("anda na ordem das categorias", () => {
    expect(categoriaVizinha(categorias, "p", 1)).toBe(bebidas);
    expect(categoriaVizinha(categorias, "b", 1)).toBe(doces);
    expect(categoriaVizinha(categorias, "b", -1)).toBe(pratos);
  });

  it("para nas pontas (não existe mais o Tudo antes da primeira)", () => {
    expect(categoriaVizinha(categorias, "p", -1)).toBeUndefined();
    expect(categoriaVizinha(categorias, "d", 1)).toBeUndefined();
  });

  it("restaurante sem categorias não tem para onde ir", () => {
    expect(categoriaVizinha([], null, 1)).toBeUndefined();
  });
});
