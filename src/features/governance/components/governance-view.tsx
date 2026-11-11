"use client";

import { useState } from "react";
import { Check, Download, Eye, EyeOff, Info, Lock } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { AnimatedNumber, Button, Modal, ScrollArea, Segmented, Select, useToast } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { AuditDecision } from "@/shared/types/domain";
import type { BiasAlert, GovernanceData } from "../api/governance";

type Period = "7d" | "30d" | "90d";
const SCALE: Record<Period, number> = { "7d": 0.27, "30d": 1, "90d": 2.8 };
const PERIOD_TEXT: Record<Period, string> = { "7d": "Últimos 7 días", "30d": "Últimos 30 días", "90d": "Últimos 90 días" };

const DAY: Record<string, string> = { Hoy: "Hoy", Ayer: "Ayer", Lun: "Lunes", Mar: "Martes", "Mié": "Miércoles", Jue: "Jueves", Vie: "Viernes", "Sáb": "Sábado", Dom: "Domingo" };
const STATUS_TONE: Record<AuditDecision["status"], string> = { meets: "bg-success-soft text-success", partial: "bg-warning-soft text-warning", does_not_meet: "bg-danger-soft text-danger", unevaluated: "bg-blue-soft text-blue" };
const STATUS_TEXT: Record<AuditDecision["status"], string> = { meets: "Cumple", partial: "Parcial", does_not_meet: "No cumple", unevaluated: "Ajuste" };
const PEOPLE = [
  { value: "all", label: "Todas las personas" },
  { value: "Ana M.", label: "Ana M." },
  { value: "Carlos P.", label: "Carlos P." },
  { value: "Sistema", label: "Cambios automáticos" },
];
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
export function GovernanceView({ data }: { data: GovernanceData }) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("30d");
  const [who, setWho] = useState("all");
  const [alert, setAlert] = useState<BiasAlert | null>(null);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const k = SCALE[period];
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
    { value: Math.round(s.resumesEvaluated * k), label: "hojas de vida evaluadas", tone: "text-ink" },
    { value: s.scoresWithEvidence, label: "% de puntajes con evidencia", tone: "text-ink" },
    { value: Math.round(s.humanDecisions * k), label: "decisiones tomadas por personas", tone: "text-ink" },
    { value: openAlerts.length, label: "alertas de sesgo por revisar", tone: openAlerts.length ? "text-warning" : "text-ink-3" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageTop
        title="Qué usó y qué no usó la IA"
        description={`${PERIOD_TEXT[period]} en ${data.organization}. Toda salida de la IA pasa por una persona.`}
        actions={
          <>
            <Segmented aria-label="Período" size="sm" value={period} onChange={setPeriod} items={[{ value: "7d", label: "7 días" }, { value: "30d", label: "30 días" }, { value: "90d", label: "90 días" }]} />
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

      <div className="flex flex-col gap-8 px-12 pt-8 pb-14">
        <div className="grid grid-cols-5 overflow-hidden rounded-2xl border border-border bg-surface animate-rise">
          {stats.map((st) => (
            <div key={st.label} className="flex flex-col gap-2 border-r border-border px-6 py-5 last:border-0">
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
                    <ul className={cn("grid gap-2", g.used ? "grid-cols-1" : "grid-cols-2")}>
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
                <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Decisiones humanas</h2>
                <p className="text-[13px] text-ink-3">Quién decidió qué, y sobre quién.</p>
              </div>
              <Select aria-label="Persona" options={PEOPLE} value={who} onChange={setWho} className="w-[200px]" triggerClassName="field-box h-9 w-full px-3 text-[13px] text-ink" />
            </header>
            <ScrollArea aria-label="Decisiones humanas" className="flex-1" viewportClassName="px-6 pb-6">
              {groups.map(([day, list]) => (
                <div key={day} className="flex flex-col">
                  <h3 className="sticky top-0 z-10 bg-surface/95 pt-5 pb-2 text-[12.5px] font-medium text-ink-3 backdrop-blur">{DAY[day] ?? day}</h3>
                  <ol className="relative flex flex-col before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-border">
                    {list.map((d, i) => (
                      <li key={`${d.action}-${d.subject}-${i}`} className="relative flex items-start gap-3.5 py-2.5 animate-[option-in_360ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 35}ms` }}>
                        <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-4 ring-surface", d.who === "Sistema" ? "bg-blue-soft text-blue" : "bg-surface-2 text-ink-2")}>
                          {d.who === "Sistema" ? "IA" : initials(d.who)}
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
                        <span className={cn("mt-1 shrink-0 rounded-full px-2 py-0.5 text-[11.5px]", STATUS_TONE[d.status])}>{STATUS_TEXT[d.status]}</span>
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
