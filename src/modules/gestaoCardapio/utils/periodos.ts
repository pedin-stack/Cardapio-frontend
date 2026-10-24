/**
 * @description Períodos das métricas em datas AAAA-MM-DD (fim inclusive), no fuso do navegador — o back interpreta
 * como data local do restaurante. Semana de segunda a domingo.
 */

export type Granularidade = "DIA" | "SEMANA" | "MES" | "TRIMESTRE" | "SEMESTRE" | "ANO";
export type Intervalo = { inicio: string; fim: string };

const MESES: Record<Exclude<Granularidade, "DIA" | "SEMANA">, number> = { MES: 1, TRIMESTRE: 3, SEMESTRE: 6, ANO: 12 };

/** AAAA-MM-DD no fuso do navegador. */
export function dataLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** AAAA-MM-DD → meia-noite local (`new Date("AAAA-MM-DD")` seria UTC e cairia no dia anterior no Brasil). */
export function paraData(texto: string): Date {
  const [ano, mes, dia] = texto.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Últimos `dias` dias, hoje incluso. */
export function ultimosDias(dias: number): Intervalo {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(fim.getDate() - (dias - 1));
  return { inicio: dataLocal(inicio), fim: dataLocal(fim) };
}

/** O dia, a semana, o mês, o trimestre, o semestre ou o ano que contém `data`. */
export function periodoQueContem(granularidade: Granularidade, data: Date): Intervalo {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const dia = data.getDate();
  if (granularidade === "DIA") return { inicio: dataLocal(data), fim: dataLocal(data) };
  if (granularidade === "SEMANA") {
    const segunda = dia - ((data.getDay() + 6) % 7);
    return { inicio: dataLocal(new Date(ano, mes, segunda)), fim: dataLocal(new Date(ano, mes, segunda + 6)) };
  }
  const meses = MESES[granularidade];
  const primeiroMes = mes - (mes % meses);
  // Dia 0 do mês seguinte = último dia do período.
  return { inicio: dataLocal(new Date(ano, primeiroMes, 1)), fim: dataLocal(new Date(ano, primeiroMes + meses, 0)) };
}

/** O período imediatamente antes (o que contém a véspera do início). */
export function periodoAnterior(granularidade: Granularidade, intervalo: Intervalo): Intervalo {
  const vespera = paraData(intervalo.inicio);
  vespera.setDate(vespera.getDate() - 1);
  return periodoQueContem(granularidade, vespera);
}

const curta = (texto: string) => paraData(texto).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const completa = (texto: string) => paraData(texto).toLocaleDateString("pt-BR");

/** "24/10/2026", "19/10 a 25/10/2026", "outubro de 2026", "3º trimestre de 2026", "2º semestre de 2026", "2026". */
export function rotuloPeriodo(granularidade: Granularidade | "PERSONALIZADO", { inicio, fim }: Intervalo): string {
  const data = paraData(inicio);
  const ano = data.getFullYear();
  switch (granularidade) {
    case "MES":
      return data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    case "TRIMESTRE":
      return `${Math.floor(data.getMonth() / 3) + 1}º trimestre de ${ano}`;
    case "SEMESTRE":
      return `${data.getMonth() < 6 ? 1 : 2}º semestre de ${ano}`;
    case "ANO":
      return String(ano);
    default:
      if (inicio === fim) return completa(inicio);
      return `${inicio.slice(0, 4) === fim.slice(0, 4) ? curta(inicio) : completa(inicio)} a ${completa(fim)}`;
  }
}
