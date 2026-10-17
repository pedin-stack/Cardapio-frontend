/**
 * @description Distingue toque simples de toque duplo (curtir com dois toques, como nas redes sociais)
 * sem disparar o simples quando o duplo acontece.
 */
import { useCallback, useEffect, useRef } from "react";

const JANELA_MS = 260;

export function useToqueDuplo(onSimples: () => void, onDuplo: () => void) {
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
      onDuplo();
      return;
    }
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      onSimples();
    }, JANELA_MS);
  }, [onSimples, onDuplo]);
}
