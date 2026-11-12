import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { PortalApplication } from "../../types/portal";
import { outcomeLabel, StageTrack } from "./stage-track";

/** Una postulación como fila: cargo, dónde, etapa en puntos y estado. Toda la fila abre el detalle. */
export function ApplicationRow({ application: a, index = 0 }: { application: PortalApplication; index?: number }) {
  const status = outcomeLabel(a);
  const ended = a.outcome !== "open";
  return (
    <li className="animate-rise" style={{ animationDelay: `${index * 60}ms` }}>
      <Link
        href={routes.portalApplication(a.id)}
        className={cn("group -mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 rounded-xl px-3 py-5 transition-colors duration-300 hover:bg-hover sm:grid-cols-[minmax(0,1fr)_200px_150px_auto]", ended && "opacity-60 hover:opacity-100")}
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-head text-[18px] leading-tight font-semibold tracking-[-0.01em]">{a.jobTitle}</span>
          <span className="truncate text-[13px] text-ink-3">
            {a.company} · {a.location}, {a.modality.toLowerCase()}
          </span>
        </span>
        <span className="col-span-2 sm:col-span-1">
          <StageTrack application={a} compact />
        </span>
        <span className={cn("text-[13px] font-medium max-sm:hidden", status.text)}>{status.label}</span>
        <ChevronRight aria-hidden className="size-4 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5 max-sm:row-start-1 max-sm:col-start-2" />
      </Link>
    </li>
  );
}
