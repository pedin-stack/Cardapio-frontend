/**
 * @description Abas do painel do gestor.
 */
import { ChartBarIcon, ForkKnifeIcon, PaletteIcon, TagIcon } from "@phosphor-icons/react";

import type { AbaPainel } from "@/components/PainelShell";

export const ABAS_GESTAO: AbaPainel[] = [
  { href: "/painel", rotulo: "Itens", Icone: ForkKnifeIcon },
  { href: "/painel/categorias", rotulo: "Categorias", Icone: TagIcon },
  { href: "/painel/metricas", rotulo: "Métricas", Icone: ChartBarIcon },
  { href: "/painel/restaurante", rotulo: "Restaurante", Icone: PaletteIcon },
];
