import { describe, expect, it } from "vitest";

import { cpfValido, mascararCpf, mascararTelefone } from "@/utils/mascaras";

describe("cpfValido", () => {
  it("aceita CPF com verificadores corretos, com ou sem máscara", () => {
    expect(cpfValido("52998224725")).toBe(true);
    expect(cpfValido("529.982.247-25")).toBe(true);
  });

  it("recusa verificador errado, tamanho errado e dígitos repetidos", () => {
    expect(cpfValido("52998224724")).toBe(false);
    expect(cpfValido("5299822472")).toBe(false);
    expect(cpfValido("11111111111")).toBe(false);
  });
});

describe("máscaras", () => {
  it("CPF é mascarado conforme digita", () => {
    expect(mascararCpf("5299")).toBe("529.9");
    expect(mascararCpf("52998224725")).toBe("529.982.247-25");
  });

  it("telefone vira (DD) com 8 ou 9 dígitos", () => {
    expect(mascararTelefone("74")).toBe("(74");
    expect(mascararTelefone("7499998888")).toBe("(74) 9999-8888");
    expect(mascararTelefone("74999998888")).toBe("(74) 99999-8888");
  });
});
