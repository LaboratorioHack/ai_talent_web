import Link from "next/link";
import { Copy, FileX, MessageSquareWarning, type LucideIcon } from "lucide-react";
import { Avatar, ScoreRing } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { PendingItem } from "@/shared/types/domain";
import type { DashboardData } from "../api/dashboard";

/** Mejores perfiles de todas las vacantes abiertas. */
export function TopProfiles({ profiles }: { profiles: DashboardData["topProfiles"] }) {
  return (
    <ul className="flex flex-col">
      {profiles.map((p, i) => (
        <li key={p.applicationId} className="animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
          <Link
            href={routes.ranking(p.vacancyId, p.applicationId)}
            className="-mx-2 flex items-center gap-3 rounded-lg border-b border-border px-2 py-3 transition-colors duration-300 last:border-0 hover:bg-hover"
          >
            <Avatar name={p.name} size={36} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13.5px] font-medium">{p.name}</span>
              <span className="truncate text-[12px] text-ink-3">{p.vacancy}</span>
            </span>
            <ScoreRing score={p.score} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const pendingIcon: Record<PendingItem["kind"], { icon: LucideIcon; tone: string }> = {
  unreadable: { icon: FileX, tone: "text-danger" },
  duplicate: { icon: Copy, tone: "text-warning" },
  contrast: { icon: MessageSquareWarning, tone: "text-blue" },
};

/** Lo que necesita una persona hoy. */
export function PendingList({ items }: { items: PendingItem[] }) {
  if (items.length === 0) return <p className="text-[13px] text-ink-3">Nada pendiente. Buen día.</p>;
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, i) => {
        const { icon: Icon, tone } = pendingIcon[item.kind];
        return (
          <li key={item.id} className="animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
            <Link href={item.href} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-300 hover:bg-hover">
              <Icon aria-hidden className={`size-4 shrink-0 ${tone}`} />
              <span className="min-w-0 flex-1 text-[13px]">{item.text}</span>
              <span className="text-[12.5px] font-medium text-blue transition-transform duration-300 group-hover:translate-x-0.5">{item.actionLabel}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
