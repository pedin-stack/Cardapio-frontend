/**
 * @description Compartilha o link de um prato (`/{slug}?item={id}` abre o detalhe dele). Usa a folha nativa do
 * celular; sem ela (desktop), copia o link.
 */
import { toast } from "react-toastify";

import type { ItemPublico } from "../types/cardapioPublico";

export async function compartilharItem(item: ItemPublico, slug: string, restaurante: string) {
  const url = `${window.location.origin}/${slug}?item=${item.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: item.nome, text: `${item.nome} · ${restaurante}`, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
  } catch (erro) {
    // Fechar a folha de compartilhar não é erro.
    if ((erro as Error)?.name !== "AbortError") toast.error("Não foi possível compartilhar. Tente de novo.");
  }
}
