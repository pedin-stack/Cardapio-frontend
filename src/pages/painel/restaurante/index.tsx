import { ProtectedRoute } from "@/auth/ProtectedRoute";
import RestaurantePage from "@/modules/gestaoCardapio/pages/RestaurantePage";

export default function PainelRestaurante() {
  return (
    <ProtectedRoute permissao="CORE_RESTAURANTE_ATUALIZAR_PROPRIO">
      <RestaurantePage />
    </ProtectedRoute>
  );
}
