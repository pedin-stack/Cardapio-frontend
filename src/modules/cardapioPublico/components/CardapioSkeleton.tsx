/**
 * @description Esqueleto do cardápio enquanto ele carrega.
 */
export function CardapioSkeleton() {
  return (
    <div className="relative mx-auto flex h-svh max-w-[480px] flex-col justify-end gap-3 px-6 pb-32" role="status" aria-label="Carregando cardápio">
      <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] mx-auto size-24 rounded-[1.75rem] shimmer" />
      <div className="mx-auto h-10 w-3/4 rounded-full shimmer" />
      <div className="mx-auto h-4 w-1/2 rounded-full shimmer" />
    </div>
  );
}
