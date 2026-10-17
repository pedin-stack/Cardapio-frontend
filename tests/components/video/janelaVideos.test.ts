import { describe, expect, it } from "vitest";

import { calcularModosVideo } from "@/components/video/janelaVideos";

describe("calcularModosVideo", () => {
  it("toca o ativo, pré-carrega o próximo, pausa o anterior e descarrega o resto", () => {
    const modos = calcularModosVideo([0, 1, 2, 3, 4], 2);
    expect(Object.fromEntries(modos)).toEqual({
      0: "descarregado",
      1: "pausado",
      2: "tocar",
      3: "precarregar",
      4: "descarregado",
    });
  });

  it("nunca mantém mais de 3 vídeos vivos", () => {
    const indices = Array.from({ length: 50 }, (_, i) => i);
    for (let ativo = -1; ativo < 50; ativo++) {
      const vivos = [...calcularModosVideo(indices, ativo).values()].filter((m) => m !== "descarregado");
      expect(vivos.length).toBeLessThanOrEqual(3);
    }
  });

  it("no hero (índice -1) já pré-carrega o primeiro vídeo do feed", () => {
    expect(calcularModosVideo([0, 3], -1).get(0)).toBe("precarregar");
  });

  it("pula cards sem vídeo: pré-carrega o próximo card que TEM vídeo", () => {
    const modos = calcularModosVideo([1, 5], 2);
    expect(modos.get(5)).toBe("precarregar");
    expect(modos.get(1)).toBe("pausado");
  });

  it("pausa o ativo com o detalhe aberto, sem perder o pré-carregamento", () => {
    const modos = calcularModosVideo([0, 1], 0, true);
    expect(modos.get(0)).toBe("pausado");
    expect(modos.get(1)).toBe("precarregar");
  });
});
