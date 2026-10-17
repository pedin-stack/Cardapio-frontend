/**
 * @description Cliente do Supabase usado SÓ para o Storage (upload com URL assinada emitida pela API).
 * A autenticação é toda da API; a chave aqui é a anon (pública).
 */
import { createClient } from "@supabase/supabase-js";

import { env } from "@/config/env";

export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
