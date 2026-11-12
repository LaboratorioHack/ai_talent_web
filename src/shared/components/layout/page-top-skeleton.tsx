import { Skeleton } from "@/shared/components/ui";

/** Carga del encabezado de página con la misma tarjeta flotante que PageTop. */
export function PageTopSkeleton({ eyebrow = true }: { eyebrow?: boolean }) {
  return (
    <div className="px-3 pt-3 sm:px-6 sm:pt-4" aria-hidden>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-5 sm:px-7">
        {eyebrow ? <Skeleton className="h-3.5 w-48" /> : null}
        <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
      </div>
    </div>
  );
}
