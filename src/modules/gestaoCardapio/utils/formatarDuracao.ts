/**
 * @description Duração legível: "4,2 s", "1 min 12 s", "2 h 05 min".
 */
export function formatarDuracao(ms: number): string {
  if (ms < 60_000) return `${(ms / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s`;
  const totalSegundos = Math.round(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  if (horas > 0) return `${horas} h ${String(minutos).padStart(2, "0")} min`;
  return segundos > 0 ? `${minutos} min ${segundos} s` : `${minutos} min`;
}

/** Contagem compacta: 1.284 → "1,3 mil". */
export function formatarContagem(valor: number): string {
  return valor.toLocaleString("pt-BR", { notation: valor >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 });
}
