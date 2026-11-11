import { Building2 } from "lucide-react";
import type { CurrentUser } from "@/shared/types/domain";

/**
 * Organización de la sesión en la barra. En el MVP un reclutador pertenece a
 * una sola compañía, así que no hay selector: solo el nombre.
 */
export function OrgBadge({ user }: { user: CurrentUser }) {
  return (
    <span className="flex h-11 shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface pr-4 pl-1.5 text-[14px] font-medium text-ink shadow-[0_1px_2px_rgba(21,32,27,0.04)]">
      <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber/20 text-[#b26d06]">
        <Building2 className="size-4" />
      </span>
      <span className="max-w-[160px] truncate min-[1680px]:max-w-[220px]">{user.company.name}</span>
    </span>
  );
}
