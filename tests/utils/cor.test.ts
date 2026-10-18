import { describe, expect, it } from "vitest";

import { COR_PADRAO, corDoTextoSobre } from "@/utils/cor";

describe("corDoTextoSobre", () => {
  it("cores claras pedem texto escuro", () => {
    expect(corDoTextoSobre("#e9b872")).toBe("#111114");
    expect(corDoTextoSobre("#ffe066")).toBe("#111114");
    expect(corDoTextoSobre("#FFFFFF")).toBe("#111114");
  });

  it("o coral padrão e cores escuras mantêm o texto branco", () => {
    expect(corDoTextoSobre(COR_PADRAO)).toBe("#ffffff");
    expect(corDoTextoSobre("#2f4a35")).toBe("#ffffff");
    expect(corDoTextoSobre("#000000")).toBe("#ffffff");
  });
});
