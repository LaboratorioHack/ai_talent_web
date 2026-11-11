"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Briefcase, MessageSquareText, Timer, Users } from "lucide-react";
import { Segmented, Select, Skeleton } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { DashboardData, Period, PeriodStats } from "../api/dashboard";
import { FunnelChart } from "./funnel-chart";
import { KpiCard } from "./kpi-card";
import { PendingList, TopProfiles } from "./side-panels";
import { VacancyBars } from "./vacancy-bars";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
];
const PERIOD_TEXT: Record<Period, string> = { "7d": "los últimos 7 días", "30d": "los últimos 30 días", "90d": "los últimos 90 días" };

function Panel({ title, subtitle, action, children, className }: { title: string; subtitle?: string; action?: { label: string; href: string }; children: ReactNode; className?: string }) {
  return (
    <section className={`card flex min-w-0 flex-col gap-6 px-5 py-5 sm:px-7 sm:py-6 ${className ?? ""}`}>
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-head text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
          {subtitle ? <p className="text-[13px] text-ink-3">{subtitle}</p> : null}
        </div>
        {action ? (
          <Link href={action.href} className="shrink-0 rounded-full px-3 py-1.5 text-[13px] text-ink-2 ring-1 ring-border transition-[color,box-shadow] duration-300 hover:text-ink hover:ring-border-strong">
            {action.label}
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}

const ZERO: PeriodStats = { received: 0, read: 0, meets: 0, partial: 0, doesNotMeet: 0, interview: 0, finalist: 0 };

/**
 * Pantalla 04 · Inicio · Panel. Los filtros (período y vacante) recalculan
 * cifras, embudo y barras al instante y con transición.
 */
export function DashboardView({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [vacancy, setVacancy] = useState("all");

  const view = useMemo(() => {
    const scope = vacancy === "all" ? data.vacancies : data.vacancies.filter((v) => v.id === vacancy);
    const totals = scope.reduce<PeriodStats>((acc, v) => {
      const s = v.byPeriod[period];
      return Object.fromEntries(Object.keys(acc).map((k) => [k, acc[k as keyof PeriodStats] + s[k as keyof PeriodStats]])) as unknown as PeriodStats;
    }, ZERO);
    return { scope, totals };
  }, [data, period, vacancy]);

  const t = view.totals;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const funnel = [
    { label: "Recibidas", value: t.received, detail: `Hojas de vida que llegaron en ${PERIOD_TEXT[period]}` },
    { label: "Leídas", value: t.read, detail: `${pct(t.read, t.received)} % se pudo leer sin pedir el original` },
    { label: "Cumplen", value: t.meets, detail: `${pct(t.meets, t.read)} % de las leídas cumple todos los obligatorios` },
    { label: "Entrevista IA", value: t.interview, detail: `${pct(t.interview, t.meets)} % de las que cumplen ya tiene entrevista` },
    { label: "Finalistas", value: t.finalist, detail: "Elegidas por tu equipo después de la entrevista" },
  ];

  const vacancyOptions = [{ value: "all", label: "Todas las vacantes abiertas" }, ...data.vacancies.map((v) => ({ value: v.id, label: v.title }))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Segmented aria-label="Período" items={PERIODS} value={period} onChange={setPeriod} />
          <Select aria-label="Vacante" options={vacancyOptions} value={vacancy} onChange={setVacancy} className="w-full sm:w-[280px]" triggerClassName="field-box h-11 w-full rounded-full px-4 text-[13.5px] text-ink" />
        </div>
        <p className="text-[13px] text-ink-3">
          Mostrando {PERIOD_TEXT[period]}
          {vacancy === "all" ? ` en ${view.scope.length} vacantes` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard index={0} label="Vacantes abiertas" value={view.scope.length} detail={`${view.scope.filter((v) => v.closesAt <= "2026-11-22").length} cierran antes del 22 nov`} icon={Briefcase} />
        <KpiCard index={1} label="Hojas de vida recibidas" value={t.received} detail={`${pct(t.read, t.received)} % leídas sin problema`} icon={Users} />
        <KpiCard index={2} label="Cumplen el perfil" value={t.meets} detail={`${pct(t.meets, t.received)} % de las recibidas`} icon={BadgeCheck} tone="success" />
        <KpiCard index={3} label="Entrevistas IA" value={t.interview} detail="Listas para revisar" icon={MessageSquareText} />
        <KpiCard index={4} label="Horas ahorradas" value={Math.round((t.received * 2.5) / 60)} detail="Unos 2,5 minutos por hoja de vida" icon={Timer} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Embudo de selección" subtitle="De todas las que llegan, cuántas avanzan en cada paso" action={{ label: "Subir hojas de vida", href: routes.candidates }}>
            <FunnelChart steps={funnel} />
          </Panel>
          <Panel title="Resultado por vacante" subtitle="Cómo quedaron las evaluadas de cada vacante" action={{ label: "Ir al ranking", href: routes.rankings }}>
            <VacancyBars rows={view.scope.map((v) => ({ id: v.id, title: v.title, closesAt: v.closesAt, ...v.byPeriod[period] }))} />
          </Panel>
        </div>
        <div className="flex flex-col gap-6">
          <Panel title="Mejores perfiles" subtitle="Puntaje más alto en todas tus vacantes" action={{ label: "Ranking", href: routes.rankings }}>
            <TopProfiles profiles={data.topProfiles} />
          </Panel>
          <Panel title="Pendientes" subtitle="Lo que necesita tu decisión">
            <PendingList items={data.pending} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <Skeleton className="h-11 w-[520px] rounded-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Skeleton className="h-[640px] rounded-2xl" />
        <Skeleton className="h-[640px] rounded-2xl" />
      </div>
    </div>
  );
}
