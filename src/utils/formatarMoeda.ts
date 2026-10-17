/**
 * @description Valores em reais.
 */
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(valor: number): string {
  return BRL.format(valor);
}
