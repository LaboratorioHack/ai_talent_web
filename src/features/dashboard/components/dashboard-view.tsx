import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Briefcase, MessageSquareText, Timer, Users } from "lucide-react";
import { Skeleton } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { DashboardData } from "../api/dashboard";
import { FunnelChart } from "./funnel-chart";
import { KpiCard } from "./kpi-card";
import { PendingList, TopProfiles } from "./side-panels";
import { VacancyBars } from "./vacancy-bars";

function Panel({ title, action, children, className }: { title: string; action?: { label: string; href: string }; children: ReactNode; className?: string }) {
  return (
    <section className={`card flex flex-col gap-5 px-6 py-5 ${className ?? ""}`}>
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="font-head text-[18px] font-semibold">{title}</h2>
        {action ? (
          <Link href={action.href} className="text-[12.5px] text-blue transition-colors hover:text-ink">
            {action.label}
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/** Pantalla 04 · Inicio · Panel. */
export function DashboardView({ data }: { data: DashboardData }) {
  const k = data.kpis;
  const pct = k.received ? Math.round((k.meets / k.received) * 100) : 0;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard index={0} label="Vacantes abiertas" value={k.openVacancies} detail={`${k.closingSoon} cierran pronto`} icon={Briefcase} />
        <KpiCard index={1} label="Hojas de vida recibidas" value={k.received} detail="En todas las vacantes abiertas" icon={Users} />
        <KpiCard index={2} label="Cumplen el perfil" value={k.meets} detail={`${pct} % de las recibidas`} icon={BadgeCheck} tone="success" />
        <KpiCard index={3} label="Entrevistas IA" value={k.interviews} detail="Listas para revisar" icon={MessageSquareText} />
        <KpiCard index={4} label="Horas ahorradas" value={k.hoursSaved} detail="Unos 2,5 minutos por hoja de vida" icon={Timer} tone="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Embudo de esta semana" action={{ label: "Ver vacantes", href: routes.vacancies }}>
            <FunnelChart steps={data.funnel} />
          </Panel>
          <Panel title="Candidatos por vacante" action={{ label: "Ir al ranking", href: routes.rankings }}>
            <VacancyBars rows={data.perVacancy} />
          </Panel>
        </div>
        <div className="flex flex-col gap-5">
          <Panel title="Mejores perfiles" action={{ label: "Ranking", href: routes.rankings }}>
            <TopProfiles profiles={data.topProfiles} />
          </Panel>
          <Panel title="Pendientes">
            <PendingList items={data.pending} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[122px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <Skeleton className="h-[520px] rounded-2xl" />
        <Skeleton className="h-[520px] rounded-2xl" />
      </div>
    </div>
  );
}
