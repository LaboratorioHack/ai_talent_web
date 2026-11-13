"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Briefcase, MessageSquareText, Timer, Users } from "lucide-react";
import { CribaAi, Segmented, Select, Skeleton } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { DashboardData, Period, PeriodStats } from "../api/dashboard";
import { AiActivity } from "./ai-activity";
import { FunnelChart } from "./funnel-chart";
import { KpiCard } from "./kpi-card";
import { PendingList, TopProfiles } from "./side-panels";
import { VacancyBars } from "./vacancy-bars";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
];
const SHORT_PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 d" },
  { value: "30d", label: "30 d" },
  { value: "90d", label: "90 d" },
];
const PERIOD_TEXT: Record<Period, string> = { "7d": "los últimos 7 días", "30d": "los últimos 30 días", "90d": "los últimos 90 días" };
/** Minutos que toma leer una hoja de vida a mano: base del cálculo de horas ahorradas. */
const READ_MINUTES = 2.5;
const ZERO: PeriodStats = { received: 0, read: 0, meets: 0, partial: 0, doesNotMeet: 0, interview: 0, finalist: 0 };

type Vac = DashboardData["vacancies"][number];

function totalsOf(scope: Vac[], period: Period): PeriodStats {
  return scope.reduce<PeriodStats>((acc, v) => {
    const s = v.byPeriod[period];
    return Object.fromEntries(Object.keys(acc).map((k) => [k, acc[k as keyof PeriodStats] + s[k as keyof PeriodStats]])) as unknown as PeriodStats;
  }, ZERO);
}

function Panel({ title, subtitle, ai, controls, action, children, className }: { title: string; subtitle?: string; ai?: string; controls?: ReactNode; action?: { label: string; href: string }; children: ReactNode; className?: string }) {
  return (
    <section className={`card flex min-w-0 flex-col gap-6 px-5 py-5 sm:px-7 sm:py-6 ${className ?? ""}`}>
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="flex flex-wrap items-center gap-2 font-head text-[19px] font-semibold tracking-[-0.01em]">
              {title}
              {ai ? <CribaAi label={ai} /> : null}
            </h2>
            {subtitle ? <p className="text-[13px] text-ink-3">{subtitle}</p> : null}
          </div>
          {action ? (
            <Link href={action.href} className="shrink-0 rounded-full px-3 py-1.5 text-[13px] text-ink-2 ring-1 ring-border transition-[color,box-shadow] duration-300 hover:text-ink hover:ring-border-strong">
              {action.label}
            </Link>
          ) : null}
        </div>
        {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
      </header>
      {children}
    </section>
  );
}

const selectTrigger = "field-box h-9 w-full rounded-full px-3.5 text-[13px] text-ink";

/** Embudo con su propio período y vacante (arranca con los del filtro general). */
function FunnelPanel({ data, period: initialPeriod, vacancy: initialVacancy, vacancyOptions }: { data: DashboardData; period: Period; vacancy: string; vacancyOptions: { value: string; label: string }[] }) {
  const [period, setPeriod] = useState(initialPeriod);
  const [vacancy, setVacancy] = useState(initialVacancy);
  const t = totalsOf(vacancy === "all" ? data.vacancies : data.vacancies.filter((v) => v.id === vacancy), period);
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const steps = [
    { label: "Recibidas", value: t.received, detail: `Hojas de vida que llegaron en ${PERIOD_TEXT[period]}` },
    { label: "Leídas", value: t.read, detail: `${pct(t.read, t.received)} % las leyó Criba AI sin pedir el original` },
    { label: "Cumplen", value: t.meets, detail: `${pct(t.meets, t.read)} % de las leídas cumple todos los obligatorios` },
    { label: "Entrevista IA", value: t.interview, detail: `${pct(t.interview, t.meets)} % de las que cumplen ya tiene entrevista` },
    { label: "Finalistas", value: t.finalist, detail: "Elegidas por tu equipo después de la entrevista" },
  ];
  return (
    <Panel
      title="Embudo de selección"
      subtitle="De todas las que llegan, cuántas avanzan en cada paso"
      ai="Lee y evalúa"
      action={{ label: "Ver postulaciones", href: routes.candidates }}
      controls={
        <>
          <Segmented aria-label="Período del embudo" size="sm" items={SHORT_PERIODS} value={period} onChange={setPeriod} />
          <Select aria-label="Vacante del embudo" options={vacancyOptions} value={vacancy} onChange={setVacancy} className="w-[240px] max-sm:w-full" triggerClassName={selectTrigger} />
        </>
      }
    >
      <FunnelChart key={`${period}-${vacancy}`} steps={steps} />
    </Panel>
  );
}

type Sort = "received" | "meets" | "closes";

/** Resultado por vacante con su período y su orden. */
function VacancyPanel({ data, period: initialPeriod }: { data: DashboardData; period: Period }) {
  const [period, setPeriod] = useState(initialPeriod);
  const [sort, setSort] = useState<Sort>("received");
  const rows = useMemo(() => {
    const list = data.vacancies.map((v) => ({ id: v.id, title: v.title, closesAt: v.closesAt, ...v.byPeriod[period] }));
    return list.sort((a, b) => (sort === "closes" ? a.closesAt.localeCompare(b.closesAt) : sort === "meets" ? b.meets - a.meets : b.received - a.received));
  }, [data, period, sort]);
  return (
    <Panel
      title="Resultado por vacante"
      subtitle="Cómo quedaron las evaluaciones de cada vacante"
      ai="Evaluó"
      action={{ label: "Ir al ranking", href: routes.rankings }}
      controls={
        <>
          <Segmented aria-label="Período por vacante" size="sm" items={SHORT_PERIODS} value={period} onChange={setPeriod} />
          <Select
            aria-label="Ordenar vacantes"
            options={[
              { value: "received", label: "Más hojas de vida" },
              { value: "meets", label: "Más que cumplen" },
              { value: "closes", label: "Cierre más cercano" },
            ]}
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            className="w-[210px] max-sm:w-full"
            triggerClassName={selectTrigger}
          />
        </>
      }
    >
      <VacancyBars key={`${period}-${sort}`} rows={rows} />
    </Panel>
  );
}

/** Mejores perfiles filtrables por vacante y cantidad. */
function TopPanel({ data, vacancyOptions }: { data: DashboardData; vacancyOptions: { value: string; label: string }[] }) {
  const [vacancy, setVacancy] = useState("all");
  const [count, setCount] = useState("5");
  const titles = new Map(data.vacancies.map((v) => [v.id, v.title]));
  const list = data.topProfiles.filter((p) => vacancy === "all" || p.vacancy === titles.get(vacancy)).slice(0, Number(count));
  return (
    <Panel
      title="Mejores perfiles"
      subtitle="Puntaje más alto, con su evidencia"
      ai="Ordenó"
      action={{ label: "Ranking", href: routes.rankings }}
      controls={
        <>
          <Select aria-label="Vacante de los mejores perfiles" options={vacancyOptions} value={vacancy} onChange={setVacancy} className="min-w-0 flex-1" triggerClassName={selectTrigger} />
          <Segmented
            aria-label="Cuántos mostrar"
            size="sm"
            items={[
              { value: "3", label: "3" },
              { value: "5", label: "5" },
            ]}
            value={count}
            onChange={setCount}
          />
        </>
      }
    >
      {list.length ? <TopProfiles key={`${vacancy}-${count}`} profiles={list} /> : <p className="text-[13px] text-ink-3">Esta vacante todavía no tiene evaluados.</p>}
    </Panel>
  );
}

/**
 * Pantalla 04 · Inicio · Panel. El filtro general mueve las cifras de arriba
 * y es el punto de partida de cada gráfico; cada gráfico tiene además su
 * propio filtro. Las insignias Criba AI dicen dónde actúa la IA.
 */
export function DashboardView({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [vacancy, setVacancy] = useState("all");

  const scope = useMemo(() => (vacancy === "all" ? data.vacancies : data.vacancies.filter((v) => v.id === vacancy)), [data, vacancy]);
  const t = totalsOf(scope, period);
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const vacancyOptions = [{ value: "all", label: "Todas las vacantes abiertas" }, ...data.vacancies.map((v) => ({ value: v.id, label: v.title }))];
  const closingSoon = scope.filter((v) => {
    if (!v.closesAt.trim()) return false;
    const [y, m, d] = v.closesAt.split("-").map(Number);
    const close = new Date(y, m - 1, d);
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return close >= new Date() && close <= limit;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Segmented aria-label="Período" items={PERIODS} value={period} onChange={setPeriod} />
          <Select aria-label="Vacante" options={vacancyOptions} value={vacancy} onChange={setVacancy} className="w-full sm:w-[280px]" triggerClassName="field-box h-11 w-full rounded-full px-4 text-[13.5px] text-ink" />
        </div>
        <p className="text-[13px] text-ink-3">
          Cifras de {PERIOD_TEXT[period]}
          {vacancy === "all" ? ` en ${scope.length === 1 ? "tu vacante abierta" : `tus ${scope.length} vacantes abiertas`}` : ""}. Cada gráfico se puede filtrar aparte.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          index={0}
          label="Vacantes abiertas"
          value={scope.length}
          detail={closingSoon ? `${closingSoon} ${closingSoon === 1 ? "cierra" : "cierran"} en los próximos 30 días` : `${scope.filter((v) => v.closesAt.trim()).length} con fecha de cierre`}
          icon={Briefcase}
        />
        <KpiCard index={1} label="Hojas de vida recibidas" value={t.received} detail={`${pct(t.read, t.received)} % leídas sin problema`} icon={Users} />
        <KpiCard index={2} label="Cumplen el perfil" value={t.meets} detail={`${pct(t.meets, t.received)} % de las recibidas`} icon={BadgeCheck} tone="success" />
        <KpiCard index={3} label="Entrevistas IA" value={t.interview} detail="Las hace Criba AI; decide tu equipo" icon={MessageSquareText} />
        <KpiCard index={4} label="Horas ahorradas" value={Math.round((t.read * READ_MINUTES) / 60)} detail={`Unos ${READ_MINUTES.toLocaleString("es-CO")} min por hoja de vida que Criba AI leyó por ti`} icon={Timer} tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FunnelPanel key={`f-${period}-${vacancy}`} data={data} period={period} vacancy={vacancy} vacancyOptions={vacancyOptions} />
          <VacancyPanel key={`v-${period}`} data={data} period={period} />
        </div>
        <div className="flex flex-col gap-6">
          <AiActivity events={data.activity} />
          <TopPanel data={data} vacancyOptions={vacancyOptions} />
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
      <Skeleton className="h-11 w-[520px] max-w-full rounded-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Skeleton className="h-[640px] rounded-2xl" />
        <Skeleton className="h-[640px] rounded-2xl" />
      </div>
    </div>
  );
}
