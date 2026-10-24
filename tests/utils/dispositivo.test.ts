import { beforeEach, describe, expect, it, vi } from "vitest";

import { esquecerSeVencido } from "@/utils/dispositivo";

const dados = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (chave: string) => dados.get(chave) ?? null,
  setItem: (chave: string, valor: string) => dados.set(chave, String(valor)),
  removeItem: (chave: string) => dados.delete(chave),
  key: (i: number) => [...dados.keys()][i] ?? null,
  get length() {
    return dados.size;
  },
});

const HORA = 60 * 60 * 1000;

describe("esquecerSeVencido", () => {
  beforeEach(() => {
    dados.clear();
    dados.set("cardapio-curtidos:casa", JSON.stringify(["a"]));
    dados.set("cardapio-curtidos-detalhes:casa", JSON.stringify({ a: { quantidade: 2, escolhas: {} } }));
    dados.set("cardapio-cliente:casa", JSON.stringify("anonimo"));
    dados.set("cardapio-cliente:bull", JSON.stringify({ token: "t", nome: "Ana", avaliacoes: {} }));
    dados.set("cardapio-dispositivo-id", "id-antigo");
    dados.set("outro-site", "fica");
  });

  it("dentro das 4 h não apaga nada", () => {
    dados.set("cardapio-validade", String(Date.now() + HORA));
    esquecerSeVencido();
    expect(dados.size).toBe(7);
  });

  it("vencido esquece o que foi feito sem login e o id, mas mantém o cliente identificado", () => {
    dados.set("cardapio-validade", String(Date.now() - 1));
    esquecerSeVencido();
    expect([...dados.keys()].sort()).toEqual(["cardapio-cliente:bull", "cardapio-validade", "outro-site"]);
    expect(Number(dados.get("cardapio-validade"))).toBeGreaterThan(Date.now() + 3.9 * HORA);
  });

  it("sem validade (dado de antes dela) conta como vencido", () => {
    esquecerSeVencido();
    expect(dados.has("cardapio-curtidos:casa")).toBe(false);
  });
});
