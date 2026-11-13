import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import { LinkPending } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { placeOf, type PortalApplication } from "../../types/portal";
import { nextStage, outcomeLabel, StageTrack } from "./stage-track";

const initials = (s: string) =>
  s
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/**
 * Una postulación como fila: monograma de la empresa, cargo, riel de etapas
 * que se llena al entrar, estado y lo que sigue. Al pasar el ratón se ilumina
 * desde la izquierda.
 */
export function ApplicationRow({ application: a, index = 0 }: { application: PortalApplication; index?: number }) {
  const status = outcomeLabel(a);
  const ended = a.outcome !== "open";
  const next = nextStage(a);
  return (
    <li className="animate-rise" style={{ animationDelay: `${index * 70}ms` }}>
      <Link
        href={routes.portalApplication(a.id)}
        className={cn(
          "group relative -mx-4 grid transition-[scale] duration-300 active:scale-[0.99] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 overflow-hidden rounded-2xl px-4 py-5 sm:grid-cols-[44px_minmax(0,1fr)_180px_auto] sm:gap-x-6",
          ended && "opacity-55 transition-opacity hover:opacity-100",
        )}
      >
        <span aria-hidden className="absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgb(242_169_59/0.09),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span
          aria-hidden
          className={cn(
            "relative flex size-11 items-center justify-center rounded-xl font-head text-[14px] font-semibold ring-1 transition-[transform,translate,scale,rotate] duration-500 ease-[var(--ease-spring)] group-hover:-rotate-3",
            a.stage === "interview" && !ended ? "bg-amber/15 text-amber ring-amber/30" : "bg-surface-2 text-ink-2 ring-border",
          )}
        >
          {initials(a.company)}
        </span>
        <span className="relative flex min-w-0 flex-col gap-1">
          <span className="truncate font-head text-[18px] leading-tight font-semibold tracking-[-0.01em]">{a.jobTitle}</span>
          <span className="truncate text-[13px] text-ink-3">
            {placeOf(a)}
            {next ? <span className="text-ink-2"> · Sigue: {next.toLowerCase()}</span> : null}
          </span>
        </span>
        <span className="relative col-span-3 flex flex-col gap-2 sm:col-span-1">
          <StageTrack application={a} compact delay={300 + index * 120} />
          <span className={cn("text-[12.5px] font-medium", status.text)}>{status.label}</span>
        </span>
        <LinkPending className="max-sm:col-start-3 max-sm:row-start-1 sm:col-start-4">
          <ChevronRight aria-hidden className="relative size-4 text-ink-3 transition-[transform,translate,color] duration-300 group-hover:translate-x-1 group-hover:text-ink" />
        </LinkPending>
      </Link>
    </li>
  );
}
