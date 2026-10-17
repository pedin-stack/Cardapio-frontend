/**
 * @description Abas do painel da plataforma (super admin). Uma só aba: a barra inferior não aparece.
 */
import { StorefrontIcon } from "@phosphor-icons/react";

import type { AbaPainel } from "@/components/PainelShell";

export const ABAS_PLATAFORMA: AbaPainel[] = [{ href: "/plataforma", rotulo: "Restaurantes", Icone: StorefrontIcon }];
