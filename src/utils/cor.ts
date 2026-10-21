/**
 * @description Cor de destaque do restaurante no cardápio público.
 */

/** Mesmo padrão de `RestauranteAtualizarRequestDTO.COR_REGEX`. */
export const COR_REGEX = /^#[0-9a-f]{6}$/i;

/** Cor padrão do cardápio (o `--destaque` do globals.css). */
export const COR_PADRAO = "#ff6b24";

/** Luminância relativa (WCAG 2) de um hex `#rrggbb`. */
function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const canal = parseInt(hex.slice(i, i + 2), 16) / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Texto sobre o destaque: branco, a não ser que a cor seja clara (amarelo, ocre, pastel), aí quase preto.
 * ponytail: corte em 0,4 (não no ponto de contraste igual, ~0,18) para manter o branco sobre o laranja da marca.
 */
export function corDoTextoSobre(hex: string): string {
  return luminancia(hex) > 0.4 ? "#111114" : "#ffffff";
}

/** Variáveis CSS do tema a partir da cor do restaurante (os derivados seguem a cor). */
export function variaveisDoTema(hex: string): Record<string, string> {
  return {
    "--destaque": hex,
    "--destaque-2": `color-mix(in oklab, ${hex} 62%, white)`,
    "--destaque-suave": `color-mix(in srgb, ${hex} 16%, transparent)`,
    "--sobre-destaque": corDoTextoSobre(hex),
  };
}
