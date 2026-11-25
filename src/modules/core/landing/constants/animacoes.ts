/**
 * @description Animações de entrada da landing.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const surgir = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: EASE } }),
};

export const entrada = {
  oculto: { opacity: 0, y: 28, filter: "blur(8px)" },
  visivel: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.1 + i * 0.12, duration: 0.8, ease: EASE } }),
};

export const naTela = { initial: "oculto", whileInView: "visivel", viewport: { once: true, margin: "-60px" } } as const;
