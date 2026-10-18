/**
 * @description Espelho 1:1 do enum Java `Permissao` (backend). Divergência causa 403 silencioso:
 * mudou no back, mude aqui primeiro — o `tsc` aponta os usos.
 */
export const PERMISSOES = [
  // CORE: restaurantes (super admin)
  "CORE_RESTAURANTE_VISUALIZAR_TODOS",
  "CORE_RESTAURANTE_CRIAR",
  "CORE_RESTAURANTE_ATUALIZAR",
  "CORE_RESTAURANTE_APAGAR",
  // CORE: o gestor muda a aparência do próprio restaurante
  "CORE_RESTAURANTE_ATUALIZAR_PROPRIO",
  // CORE: upload de mídia
  "CORE_MIDIA_CRIAR",
  // CARDAPIO: categorias
  "CARDAPIO_CATEGORIA_VISUALIZAR_PROPRIAS",
  "CARDAPIO_CATEGORIA_CRIAR",
  "CARDAPIO_CATEGORIA_ATUALIZAR",
  "CARDAPIO_CATEGORIA_APAGAR",
  // CARDAPIO: itens
  "CARDAPIO_ITEM_VISUALIZAR_PROPRIOS",
  "CARDAPIO_ITEM_CRIAR",
  "CARDAPIO_ITEM_ATUALIZAR",
  "CARDAPIO_ITEM_APAGAR",
  // CARDAPIO: métricas
  "CARDAPIO_METRICA_VISUALIZAR_PROPRIAS",
] as const;

export type Permissao = (typeof PERMISSOES)[number];
