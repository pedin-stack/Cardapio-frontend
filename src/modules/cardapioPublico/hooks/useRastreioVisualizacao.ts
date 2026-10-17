/**
 * @description Métrica "tempo gasto em cada item": mede o item em foco enquanto a aba está visível e envia
 * em lote a cada 15 s e ao sair da página (pagehide/aba escondida). Falha de envio é silenciosa: métrica
 * nunca atrapalha o cliente.
 */
import { useEffect, useRef } from "react";

import { enviarVisualizacoes } from "../services/cardapioPublicoService";
import { AgregadorVisualizacoes } from "../utils/agregadorVisualizacoes";

const INTERVALO_ENVIO_MS = 15_000;

export function useRastreioVisualizacao(slug: string | undefined, itemEmFoco: string | null) {
  const agregador = useRef(new AgregadorVisualizacoes());
  const focoAtual = useRef(itemEmFoco);

  useEffect(() => {
    focoAtual.current = itemEmFoco;
    if (document.visibilityState === "visible") {
      agregador.current.focar(itemEmFoco, performance.now());
    }
  }, [itemEmFoco]);

  useEffect(() => {
    if (!slug) return;
    const enviar = () => {
      const lote = agregador.current.drenar(performance.now());
      if (lote.length > 0) enviarVisualizacoes(slug, lote).catch(() => undefined);
    };
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") {
        agregador.current.focar(null, performance.now());
        enviar();
      } else {
        agregador.current.focar(focoAtual.current, performance.now());
      }
    };

    const intervalo = window.setInterval(enviar, INTERVALO_ENVIO_MS);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("pagehide", enviar);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("pagehide", enviar);
      enviar();
    };
  }, [slug]);
}
