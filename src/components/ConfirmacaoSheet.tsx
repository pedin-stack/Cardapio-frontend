/**
 * @description Confirmação de ação destrutiva/sensível em folha inferior.
 */
import { BottomSheet } from "@/components/BottomSheet";
import { Botao } from "@/components/Botao";

type ConfirmacaoSheetProps = {
  isOpen: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  perigo?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmacaoSheet({ isOpen, titulo, descricao, rotuloConfirmar, perigo, loading, onConfirm, onClose }: ConfirmacaoSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} titulo={titulo}>
      <p className="text-(--texto-suave)">{descricao}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Botao variante="secundario" onClick={onClose} disabled={loading}>
          Cancelar
        </Botao>
        <Botao variante={perigo ? "perigo" : "primario"} onClick={onConfirm} loading={loading}>
          {rotuloConfirmar}
        </Botao>
      </div>
    </BottomSheet>
  );
}
