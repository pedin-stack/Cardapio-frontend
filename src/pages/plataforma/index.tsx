import { ProtectedRoute } from "@/auth/ProtectedRoute";
import RestaurantesPage from "@/modules/plataforma/pages/RestaurantesPage";

export default function PlataformaRestaurantes() {
  return (
    <ProtectedRoute permissao="CORE_RESTAURANTE_VISUALIZAR_TODOS">
      <RestaurantesPage />
    </ProtectedRoute>
  );
}
