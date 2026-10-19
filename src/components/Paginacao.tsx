/**
 * @description Anterior / "x de y" / próxima. `page` começa em 0, como no `Page` do Spring; some com uma página só.
 */
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

type PaginacaoProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

export function Paginacao({ page, totalPages, onChange, className = "mt-6" }: PaginacaoProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className={`flex items-center justify-center gap-3 text-sm ${className}`}>
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Página anterior" className="grid size-9 place-items-center rounded-full bg-white/8 transition hover:bg-white/15 disabled:opacity-30">
        <CaretLeftIcon size={16} aria-hidden />
      </button>
      <span className="text-(--texto-suave) tabular-nums">
        {page + 1} de {totalPages}
      </span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page + 1 >= totalPages} aria-label="Próxima página" className="grid size-9 place-items-center rounded-full bg-white/8 transition hover:bg-white/15 disabled:opacity-30">
        <CaretRightIcon size={16} aria-hidden />
      </button>
    </nav>
  );
}
