/**
 * @description Acumula o tempo de tela por item (puro, sem DOM): o item "em foco" é o card ativo do feed
 * ou o item aberto no detalhe. `drenar` devolve o lote desde o último envio e zera.
 */
import type { VisualizacaoItem } from "../types/cardapioPublico";

export class AgregadorVisualizacoes {
  private emFoco: string | null = null;
  private desde = 0;
  private readonly acumulado = new Map<string, number>();

  /** Troca o item em foco (null = nada na tela, ex.: aba escondida). */
  focar(itemId: string | null, agora: number): void {
    this.fecharTrechoAtual(agora);
    this.emFoco = itemId;
    this.desde = agora;
  }

  get itemEmFoco(): string | null {
    return this.emFoco;
  }

  drenar(agora: number): VisualizacaoItem[] {
    this.fecharTrechoAtual(agora);
    this.desde = agora;
    const lote = [...this.acumulado.entries()]
      .map(([itemId, duracaoMs]) => ({ itemId, duracaoMs: Math.round(duracaoMs) }))
      .filter((v) => v.duracaoMs > 0);
    this.acumulado.clear();
    return lote;
  }

  private fecharTrechoAtual(agora: number): void {
    if (this.emFoco && agora > this.desde) {
      this.acumulado.set(this.emFoco, (this.acumulado.get(this.emFoco) ?? 0) + (agora - this.desde));
    }
  }
}
