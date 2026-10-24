import { describe, expect, it } from "vitest";

import { periodoAnterior, periodoQueContem, rotuloPeriodo } from "@/modules/gestaoCardapio/utils/periodos";

const em = (ano: number, mes: number, dia: number) => new Date(ano, mes - 1, dia);

describe("periodoQueContem", () => {
  it("semana vai de segunda a domingo, mesmo partindo do domingo", () => {
    expect(periodoQueContem("SEMANA", em(2026, 10, 25))).toEqual({ inicio: "2026-10-19", fim: "2026-10-25" });
    expect(periodoQueContem("SEMANA", em(2026, 10, 19))).toEqual({ inicio: "2026-10-19", fim: "2026-10-25" });
  });

  it("mês termina no último dia (fevereiro bissexto)", () => {
    expect(periodoQueContem("MES", em(2028, 2, 10))).toEqual({ inicio: "2028-02-01", fim: "2028-02-29" });
  });

  it("trimestre, semestre e ano", () => {
    expect(periodoQueContem("TRIMESTRE", em(2026, 8, 15))).toEqual({ inicio: "2026-07-01", fim: "2026-09-30" });
    expect(periodoQueContem("SEMESTRE", em(2026, 6, 30))).toEqual({ inicio: "2026-01-01", fim: "2026-06-30" });
    expect(periodoQueContem("ANO", em(2026, 10, 24))).toEqual({ inicio: "2026-01-01", fim: "2026-12-31" });
  });
});

describe("periodoAnterior", () => {
  it("vira o ano", () => {
    expect(periodoAnterior("MES", { inicio: "2026-01-01", fim: "2026-01-31" })).toEqual({ inicio: "2025-12-01", fim: "2025-12-31" });
    expect(periodoAnterior("TRIMESTRE", { inicio: "2026-01-01", fim: "2026-03-31" })).toEqual({ inicio: "2025-10-01", fim: "2025-12-31" });
    expect(periodoAnterior("SEMANA", { inicio: "2026-01-05", fim: "2026-01-11" })).toEqual({ inicio: "2025-12-29", fim: "2026-01-04" });
  });

  it("dia anterior", () => {
    expect(periodoAnterior("DIA", { inicio: "2026-03-01", fim: "2026-03-01" })).toEqual({ inicio: "2026-02-28", fim: "2026-02-28" });
  });
});

describe("rotuloPeriodo", () => {
  it("fala o período como a gente fala", () => {
    expect(rotuloPeriodo("DIA", { inicio: "2026-10-24", fim: "2026-10-24" })).toBe("24/10/2026");
    expect(rotuloPeriodo("SEMANA", { inicio: "2026-10-19", fim: "2026-10-25" })).toBe("19/10 a 25/10/2026");
    expect(rotuloPeriodo("MES", { inicio: "2026-10-01", fim: "2026-10-31" })).toBe("outubro de 2026");
    expect(rotuloPeriodo("TRIMESTRE", { inicio: "2026-07-01", fim: "2026-09-30" })).toBe("3º trimestre de 2026");
    expect(rotuloPeriodo("SEMESTRE", { inicio: "2026-07-01", fim: "2026-12-31" })).toBe("2º semestre de 2026");
    expect(rotuloPeriodo("ANO", { inicio: "2026-01-01", fim: "2026-12-31" })).toBe("2026");
    expect(rotuloPeriodo("PERSONALIZADO", { inicio: "2025-12-20", fim: "2026-01-10" })).toBe("20/12/2025 a 10/01/2026");
  });
});
