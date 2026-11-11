"use client";

import { useState } from "react";
import { Check, Download, Eye, EyeOff, Info, Lock } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { AnimatedNumber, Button, Modal, Segmented, StatusChip, useToast } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { BiasAlert, GovernanceData } from "../api/governance";

type Period = "7d" | "30d" | "90d";
const SCALE: Record<Period, number> = { "7d": 0.27, "30d": 1, "90d": 2.8 };
const PERIOD_TEXT: Record<Period, string> = { "7d": "Últimos 7 días", "30d": "Últimos 30 días", "90d": "Últimos 90 días" };

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
  const [all, setAll] = useState(false);
  const [alert, setAlert] = useState<BiasAlert | null>(null);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const k = SCALE[period];
  const s = data.stats;
  const openAlerts = data.alerts.filter((a) => !reviewed.includes(a.id));

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

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <section className="flex flex-col gap-4 animate-rise [animation-delay:140ms]">
            <header className="flex items-baseline justify-between gap-4">
              <h2 className="font-head text-[21px] font-semibold tracking-[-0.01em]">Atributos</h2>
              <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
                <Lock aria-hidden className="size-3.5" />
                Fijo por política, no se puede cambiar
              </span>
            </header>
            <ul className="card flex flex-col px-5">
              {data.attributes.map((a, i) => (
                <li key={a.label} className="flex items-center gap-3 border-b border-border py-3.5 last:border-0 animate-[option-in_360ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 35}ms` }}>
                  {a.used ? <Eye aria-hidden className="size-4 text-ink-2" /> : <EyeOff aria-hidden className="size-4 text-ink-3" />}
                  <span className={cn("flex-1 text-[14px]", !a.used && "text-ink-2")}>{a.label}</span>
                  <span className="text-[12.5px] text-ink-3">{a.note}</span>
                  <span className={cn("w-[84px] rounded-full py-1 text-center text-[12px] font-medium", a.used ? "bg-success-soft text-success" : "bg-surface-2 text-ink-2")}>{a.used ? "Se usa" : "No se usa"}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4 animate-rise [animation-delay:200ms]">
            <header className="flex items-baseline justify-between gap-4">
              <h2 className="font-head text-[21px] font-semibold tracking-[-0.01em]">Decisiones humanas</h2>
              <span className="text-[12.5px] text-ink-3">Quién decidió qué, y sobre quién</span>
            </header>
            <ul className="card flex flex-col px-5">
              {(all ? data.decisions : data.decisions.slice(0, 6)).map((d, i) => (
                <li key={`${d.when}-${d.action}-${i}`} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-border py-3.5 last:border-0 animate-[option-in_360ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                  <span className="text-[12.5px] text-ink-3">{d.when}</span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[14px]">{d.action}</span>
                    <span className="truncate text-[12.5px] text-ink-3">
                      {d.who} sobre {d.subject}
                    </span>
                  </span>
                  {d.status === "unevaluated" ? <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-ink-2">Configuración</span> : <StatusChip status={d.status} size="sm" />}
                </li>
              ))}
            </ul>
            {data.decisions.length > 6 ? (
              <button type="button" onClick={() => setAll((v) => !v)} className="self-start rounded-full px-3.5 py-1.5 text-[13px] text-ink-2 ring-1 ring-border transition-[color,box-shadow] hover:text-ink hover:ring-border-strong">
                {all ? "Ver menos" : `Ver las ${Math.round(s.humanDecisions * k)} del período`}
              </button>
            ) : null}
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
