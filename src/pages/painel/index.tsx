import { ProtectedRoute } from "@/auth/ProtectedRoute";
import ItensPage from "@/modules/gestaoCardapio/pages/ItensPage";

export default function PainelItens() {
  return (
    <ProtectedRoute permissao="CARDAPIO_ITEM_VISUALIZAR_PROPRIOS">
      <ItensPage />
    </ProtectedRoute>
  );
}
