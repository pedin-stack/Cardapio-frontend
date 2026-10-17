import { describe, expect, it } from "vitest";

import { AgregadorVisualizacoes } from "@/modules/cardapioPublico/utils/agregadorVisualizacoes";

describe("AgregadorVisualizacoes", () => {
  it("soma o tempo de cada item em foco e zera ao drenar", () => {
    const agregador = new AgregadorVisualizacoes();
    agregador.focar("a", 0);
    agregador.focar("b", 1000);
    agregador.focar("a", 3000);

    expect(agregador.drenar(3500)).toEqual([
      { itemId: "a", duracaoMs: 1500 },
      { itemId: "b", duracaoMs: 2000 },
    ]);
    expect(agregador.drenar(3500)).toEqual([]);
  });

  it("não conta o tempo sem nada em foco (aba escondida)", () => {
    const agregador = new AgregadorVisualizacoes();
    agregador.focar("a", 0);
    agregador.focar(null, 1000);
    agregador.focar("a", 60_000);

    expect(agregador.drenar(61_000)).toEqual([{ itemId: "a", duracaoMs: 2000 }]);
  });

  it("drenar no meio do foco continua contando depois sem duplicar", () => {
    const agregador = new AgregadorVisualizacoes();
    agregador.focar("a", 0);
    expect(agregador.drenar(1000)).toEqual([{ itemId: "a", duracaoMs: 1000 }]);
    expect(agregador.drenar(2500)).toEqual([{ itemId: "a", duracaoMs: 1500 }]);
  });
});
