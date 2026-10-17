import { ProtectedRoute } from "@/auth/ProtectedRoute";
import MetricasPage from "@/modules/gestaoCardapio/pages/MetricasPage";

export default function PainelMetricas() {
  return (
    <ProtectedRoute permissao="CARDAPIO_METRICA_VISUALIZAR_PROPRIAS">
      <MetricasPage />
    </ProtectedRoute>
  );
}
