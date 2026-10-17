import { ProtectedRoute } from "@/auth/ProtectedRoute";
import CategoriasPage from "@/modules/gestaoCardapio/pages/CategoriasPage";

export default function PainelCategorias() {
  return (
    <ProtectedRoute permissao="CARDAPIO_CATEGORIA_VISUALIZAR_PROPRIAS">
      <CategoriasPage />
    </ProtectedRoute>
  );
}
