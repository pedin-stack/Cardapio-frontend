import { ProtectedRoute } from "@/auth/ProtectedRoute";
import AdicionaisPage from "@/modules/gestaoCardapio/pages/AdicionaisPage";

export default function PainelAdicionais() {
  return (
    <ProtectedRoute permissao="CARDAPIO_ITEM_VISUALIZAR_PROPRIOS">
      <AdicionaisPage />
    </ProtectedRoute>
  );
}
