"use client";

import { useMemo, useState } from "react";
import { Check, Download, Eye, EyeOff, Info, Lock, Settings } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { AnimatedNumber, Button, CribaCharacter, Modal, ScrollArea, Segmented, Select, useToast } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { AuditDecision } from "@/shared/types/domain";
import { fetchGovernance } from "../api/governance-browser";
import type { BiasAlert, GovernanceData, GovernancePeriod as Period } from "../types";

const PERIOD_TEXT: Record<Period, string> = { "7d": "Últimos 7 días", "30d": "Últimos 30 días", "90d": "Últimos 90 días" };

const DAY: Record<string, string> = { Hoy: "Hoy", Ayer: "Ayer", Lun: "Lunes", Mar: "Martes", "Mié": "Miércoles", Jue: "Jueves", Vie: "Viernes", "Sáb": "Sábado", Dom: "Domingo" };
const STATUS_TONE: Record<AuditDecision["status"], string> = { meets: "bg-success-soft text-success", partial: "bg-warning-soft text-warning", does_not_meet: "bg-danger-soft text-danger", unevaluated: "bg-blue-soft text-blue", none: "" };
const STATUS_TEXT: Record<AuditDecision["status"], string> = { meets: "Cumple", partial: "Parcial", does_not_meet: "No cumple", unevaluated: "Sin evaluar", none: "" };
/** Así llama el back a las acciones de la IA (GovernanceService.CribaAi). */
const CRIBA_AI = "Criba AI";
const AUTOMATIC = "Sistema";
const rank = (who: string) => (who === AUTOMATIC ? 2 : who === CRIBA_AI ? 1 : 0);
const ATTRIBUTE_GROUPS = [
  { title: "Nunca entran al puntaje", hint: "Se borran al leer, antes de evaluar", used: false },
  { title: "Entran al puntaje", hint: "Solo si un requisito los pide", used: true },
];
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("");

function exportCsv(data: GovernanceData) {
  const rows = [["Cuándo", "Acción", "Quién", "Sobre"], ...data.decisions.map((d) => [d.when, d.action, d.who, d.subject])];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "auditoria_criba.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Pantalla 11 · Gobierno de IA · Auditoría de qué se usó, qué no y quién decidió. */
export function GovernanceView({ data: initial }: { data: GovernanceData }) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  /** Cada período es una consulta real a la auditoría; mientras llega, la pantalla se atenúa. */
  async function changePeriod(next: Period) {
    setPeriod(next);
    setLoading(true);
    try {
      setData(await fetchGovernance(next));
    } catch {
      toast({ tone: "error", title: "No se pudo cargar el período", description: "Revisa tu conexión e inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  // Las personas del filtro salen de las decisiones registradas, no de una lista fija.
  const people = useMemo(
    () => [
      { value: "all", label: "Todas las personas" },
      ...[...new Set(data.decisions.map((d) => d.who))]
        // Primero las personas; al final Criba AI y los cambios automáticos.
        .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, "es"))
        .map((who) => ({ value: who, label: who === AUTOMATIC ? "Cambios automáticos" : who })),
    ],
    [data.decisions],
  );
  const [who, setWho] = useState("all");
  const [alert, setAlert] = useState<BiasAlert | null>(null);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const s = data.stats;
  const openAlerts = data.alerts.filter((a) => !reviewed.includes(a.id));
  const groups = Object.entries(
    data.decisions
      .filter((d) => who === "all" || d.who === who)
      .reduce<Record<string, AuditDecision[]>>((acc, d) => {
        const day = d.when.split(" ")[0];
        (acc[day] ??= []).push(d);
        return acc;
      }, {}),
  );

  const stats = [
    { value: s.sensitiveUsed, label: "datos sensibles usados", tone: "text-success" },
    { value: s.resumesEvaluated, label: "hojas de vida evaluadas", tone: "text-ink" },
    { value: s.scoresWithEvidence, label: "% de puntajes con evidencia", tone: "text-ink" },
    { value: s.humanDecisions, label: "decisiones tomadas por personas", tone: "text-ink" },
    openAlerts.length
      ? { value: openAlerts.length, label: "alertas de sesgo por revisar", tone: "text-warning" }
      : { value: s.aiErrorsFlagged, label: "errores de la IA marcados por personas", tone: "text-ink" },
  ];

  return (
    <div className={cn("flex flex-1 flex-col transition-opacity duration-300", loading && "opacity-60")} aria-busy={loading}>
      <PageTop
        title="Qué usó y qué no usó Criba AI"
        description={`${PERIOD_TEXT[period]} en ${data.organization}. Toda salida de la IA pasa por una persona.`}
        actions={
          <>
            <Segmented aria-label="Período" size="sm" value={period} onChange={(p) => void changePeriod(p)} items={[{ value: "7d", label: "7 días" }, { value: "30d", label: "30 días" }, { value: "90d", label: "90 días" }]} />
            <Button
              variant="outline"
              icon={<Download />}
              onClick={() => {
                exportCsv(data);
                toast({ title: "Informe exportado", description: "auditoria_criba.csv con todas las decisiones del período." });
              }}
            >
              Exportar informe
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 px-4 pt-6 pb-10 sm:gap-8 sm:px-6 sm:pt-8 lg:px-12 lg:pb-14">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border animate-rise sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((st) => (
            <div key={st.label} className="flex flex-col gap-2 bg-surface px-5 py-5 last:col-span-2 sm:px-6 lg:last:col-span-1">
              <AnimatedNumber value={st.value} className={cn("font-head text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums", st.tone)} />
              <span className="text-[13px] text-ink-2">{st.label}</span>
            </div>
          ))}
        </div>

        {openAlerts.length ? (
          <section className="flex flex-col gap-2 animate-rise [animation-delay:80ms]">
            {openAlerts.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-warning/30 bg-warning-soft/60 px-5 py-3.5">
                <Info aria-hidden className="size-4 shrink-0 text-warning" />
                <span className="flex-1 text-[13.5px]">
                  <strong className="font-medium">{a.vacancy}:</strong> {a.text}
                </span>
                <Button variant="text" size="sm" onClick={() => setAlert(a)}>
                  Revisar
                </Button>
              </div>
            ))}
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="card flex h-[560px] flex-col overflow-hidden animate-rise [animation-delay:140ms]">
            <header className="flex items-start justify-between gap-4 border-b border-border px-6 pt-5 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Atributos</h2>
                <p className="text-[13px] text-ink-3">Qué mira la IA de cada hoja de vida y qué nunca.</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-ink-2">
                <Lock aria-hidden className="size-3" />
                Fijo por política
              </span>
            </header>
            <ScrollArea aria-label="Atributos" className="flex-1" viewportClassName="px-6 pb-6">
              {ATTRIBUTE_GROUPS.map((g) => {
                const items = data.attributes.filter((a) => a.used === g.used);
                return (
                  <div key={g.title} className="flex flex-col pt-5">
                    <div className="flex items-baseline justify-between gap-3 pb-2.5">
                      <h3 className={cn("text-[13.5px] font-semibold", g.used ? "text-success" : "text-ink")}>
                        {g.title} <span className="font-normal text-ink-3">{items.length}</span>
                      </h3>
                      <span className="text-[12px] text-ink-3">{g.hint}</span>
                    </div>
                    <ul className={cn("grid gap-2", g.used ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
                      {items.map((a, i) => (
                        <li
                          key={a.label}
                          className={cn("flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13.5px] animate-[option-in_360ms_var(--ease-out-soft)_both]", g.used ? "bg-success-soft/50" : "bg-surface-2")}
                          style={{ animationDelay: `${i * 35}ms` }}
                        >
                          {g.used ? <Eye aria-hidden className="size-4 shrink-0 text-success" /> : <EyeOff aria-hidden className="size-4 shrink-0 text-ink-3" />}
                          <span className={cn("flex-1", !g.used && "text-ink-2")}>{a.label}</span>
                          {g.used ? <span className="text-[12px] text-ink-3">{a.note}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </ScrollArea>
          </section>

          <section className="card flex h-[560px] flex-col overflow-hidden animate-rise [animation-delay:200ms]">
            <header className="flex items-start justify-between gap-4 border-b border-border px-6 pt-5 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Registro de acciones</h2>
                <p className="text-[13px] text-ink-3">Qué hizo cada persona y qué hizo Criba AI, y sobre quién.</p>
              </div>
              <Select aria-label="Persona" options={people} value={who} onChange={setWho} className="w-[200px]" triggerClassName="field-box h-9 w-full px-3 text-[13px] text-ink" />
            </header>
            <ScrollArea aria-label="Registro de acciones" className="flex-1" viewportClassName="px-6 pb-6">
              {groups.map(([day, list]) => (
                <div key={day} className="flex flex-col">
                  <h3 className="sticky top-0 z-10 bg-surface/95 pt-5 pb-2 text-[12.5px] font-medium text-ink-3 backdrop-blur">{DAY[day] ?? day}</h3>
                  <ol className="relative flex flex-col before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-border">
                    {list.map((d, i) => (
                      <li key={`${d.action}-${d.subject}-${i}`} className="relative flex items-start gap-3.5 py-2.5 animate-[option-in_360ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 35}ms` }}>
                        <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-4 ring-surface", d.who === CRIBA_AI ? "bg-amber/15" : d.who === AUTOMATIC ? "bg-blue-soft text-blue" : "bg-surface-2 text-ink-2")}>
                          {d.who === CRIBA_AI ? <CribaCharacter size={18} /> : d.who === AUTOMATIC ? <Settings aria-hidden className="size-3.5" /> : initials(d.who)}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                          <span className="text-[13.5px] leading-snug">
                            <strong className="font-medium">{d.who}</strong> {d.action.charAt(0).toLowerCase() + d.action.slice(1)}
                          </span>
                          <span className="text-[12.5px] text-ink-3">
                            {d.subject}
                            {d.when.includes(":") ? `, ${d.when.split(" ")[1]}` : ""}
                          </span>
                        </span>
                        {d.status !== "none" ? <span className={cn("mt-1 shrink-0 rounded-full px-2 py-0.5 text-[11.5px]", STATUS_TONE[d.status])}>{STATUS_TEXT[d.status]}</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              {groups.length === 0 ? <p className="py-10 text-center text-[13.5px] text-ink-3">Sin decisiones de esta persona en el período.</p> : null}
            </ScrollArea>
          </section>
        </div>
      </div>

      <Modal
        open={alert !== null}
        onClose={() => setAlert(null)}
        title="Alerta de sesgo"
        description={alert ? `${alert.vacancy}. ${alert.text}.` : undefined}
        footer={
          <>
            <Button variant="text" onClick={() => setAlert(null)}>
              Cerrar
            </Button>
            <Button
              icon={<Check />}
              onClick={() => {
                if (alert) setReviewed((r) => [...r, alert.id]);
                setAlert(null);
                toast({ title: "Alerta marcada como revisada", description: "Queda en la auditoría con tu nombre." });
              }}
            >
              Marcar como revisada
            </Button>
          </>
        }
      >
        <p className="rounded-xl bg-surface-2 px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-2">{alert?.detail}</p>
      </Modal>
    </div>
  );
}
