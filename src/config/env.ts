/**
 * @description Variáveis públicas validadas de uma vez. NEXT_PUBLIC_* é embutida no bundle em BUILD:
 * faltou aqui, gere o build de novo depois de preencher o .env (blueprint §12.3).
 */

// Acesso literal (process.env.X) é obrigatório: o Next só substitui referências estáticas no build.
const valores = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
  NEXT_PUBLIC_SUPABASE_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_BUCKET,
};

const ausentes = Object.entries(valores)
  .filter(([, valor]) => !valor)
  .map(([nome]) => nome);

if (ausentes.length > 0) {
  throw new Error(
    `Configuração ausente: ${ausentes.join(", ")}. Defina no .env.local ANTES do build — ` +
      "variáveis NEXT_PUBLIC_* são embutidas no bundle em tempo de build. Veja .env.example.",
  );
}

export const env = valores as Record<keyof typeof valores, string>;
