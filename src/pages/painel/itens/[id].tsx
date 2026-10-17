import { ProtectedRoute } from "@/auth/ProtectedRoute";
import ItemFormPage from "@/modules/gestaoCardapio/pages/ItemFormPage";

export default function PainelItem() {
  return (
    <ProtectedRoute permissao="CARDAPIO_ITEM_VISUALIZAR_PROPRIOS">
      <ItemFormPage />
    </ProtectedRoute>
  );
}
