import { ProtectedRoute } from "@/auth/ProtectedRoute";
import RestauranteFormPage from "@/modules/plataforma/pages/RestauranteFormPage";

export default function PlataformaRestaurante() {
  return (
    <ProtectedRoute permissao="CORE_RESTAURANTE_VISUALIZAR_TODOS">
      <RestauranteFormPage />
    </ProtectedRoute>
  );
}
