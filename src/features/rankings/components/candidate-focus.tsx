"use client";

import Link from "next/link";
import { CalendarPlus, EyeOff, FileText, RotateCcw, Trash2 } from "lucide-react";
import { AnimatedNumber, Avatar, Button, StatusChip } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { RankedCandidate, RankRequirement } from "../types/ranking";
import { CompositionBar } from "./composition-bar";
import { EvidenceTable } from "./evidence-table";

const CHIP = { MEETS: "meets", PARTIAL: "partial", DOES_NOT_MEET: "does_not_meet" } as const;
const TONE = { MEETS: "text-success", PARTIAL: "text-warning", DOES_NOT_MEET: "text-danger" } as const;

const evaluatedAt = (iso: string) => {
  const d = new Date(iso);
  const month = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()];
  return `${d.getDate()} ${month} a las ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export interface CandidateFocusProps {
  candidate: RankedCandidate;
  requirements: RankRequirement[];
  profileVersion: number;
  discarded?: string;
  invited?: string;
  onInvite: () => void;
  onDiscard: () => void;
  onRestore: () => void;
  onOpenResume: () => void;
  onAiError: (requirementId: string) => void;
  onEquivalences: (requirementId: string) => void;
}

/** Pantalla 08 · Foco de candidato: puntaje, de dónde sale, evidencia y qué validar. */
export function CandidateFocus({ candidate: c, requirements, profileVersion, discarded, invited, onInvite, onDiscard, onRestore, onOpenResume, onAiError, onEquivalences }: CandidateFocusProps) {
  const bars = Math.round(c.confidence * 5);

  return (
    <article key={c.id} className="stagger flex flex-col gap-7 [&>*]:animate-rise">
      <header className="flex items-start gap-5" style={{ "--i": 0 } as React.CSSProperties}>
        <Avatar name={c.name} size={68} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="truncate font-head text-[32px] leading-none font-semibold tracking-[-0.02em]">{c.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={discarded ? "discarded" : CHIP[c.fulfillment]}>
              {discarded ? "Descartado" : `${c.fulfillment === "MEETS" ? "Cumple" : c.fulfillment === "PARTIAL" ? "Cumple parcialmente" : "No cumple"}, ${c.mandatoryMet} de ${c.mandatoryTotal} obligatorios`}
            </StatusChip>
            {invited ? <StatusChip status="evaluating">Entrevista enviada, responde hasta el {invited}</StatusChip> : null}
          </div>
          <p className="text-[12.5px] text-ink-3">
            {c.sourceLabel}, evaluada el {evaluatedAt(c.evaluatedAt)} con el perfil versión {profileVersion}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={cn("font-head text-[64px] leading-[0.85] font-semibold tracking-[-0.04em] tabular-nums", discarded ? "text-ink-3" : TONE[c.fulfillment])}>
            <AnimatedNumber value={c.score} duration={700} />
          </span>
          <span className="text-[12px] text-ink-3">de 100</span>
          <span className="flex items-center gap-2 text-[12px] text-ink-2" title="Qué tan segura está la IA de su lectura">
            Confianza {Math.round(c.confidence * 100)} %
            <span className="flex items-end gap-[2px]" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={cn("w-[4px] rounded-[1px]", n <= bars ? "bg-blue" : "bg-surface-3")} style={{ height: 4 + n * 2.4 }} />
              ))}
            </span>
          </span>
        </div>
      </header>

      {discarded ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-2 px-5 py-3.5 text-[13.5px]" style={{ "--i": 1 } as React.CSSProperties}>
          <span className="text-ink-2">
            Descartado por: <strong className="font-medium text-ink">{discarded}</strong>. El motivo quedó en la auditoría.
          </span>
          <Button variant="text" icon={<RotateCcw />} onClick={onRestore}>
            Deshacer
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2" style={{ "--i": 1 } as React.CSSProperties}>
          <Button icon={<CalendarPlus />} onClick={onInvite} disabled={Boolean(invited)}>
            {invited ? "Invitación enviada" : "Invitar a entrevista"}
          </Button>
          <Button variant="outline" icon={<FileText />} onClick={onOpenResume}>
            Abrir hoja de vida
          </Button>
          <Button variant="text" icon={<Trash2 />} onClick={onDiscard} className="ml-auto text-ink-2 hover:text-danger">
            Descartar con motivo
          </Button>
        </div>
      )}

      <div style={{ "--i": 2 } as React.CSSProperties}>
        <CompositionBar key={c.id} score={c.score} requirements={requirements} results={c.results} />
      </div>

      <div style={{ "--i": 3 } as React.CSSProperties}>
        <EvidenceTable requirements={requirements} results={c.results} onOpenResume={onOpenResume} onAiError={onAiError} onEquivalences={onEquivalences} />
      </div>

      <footer className="flex flex-col gap-3 border-t border-border pt-5" style={{ "--i": 4 } as React.CSSProperties}>
        {c.toValidate.length ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="mr-1 font-medium">Validar en la entrevista</span>
            {c.toValidate.map((t) => (
              <span key={t.label} className={cn("rounded-full px-2.5 py-1 text-[12.5px]", t.tone === "warning" ? "bg-warning-soft text-warning" : "bg-surface-2 text-ink-2")}>
                {t.label}
              </span>
            ))}
          </div>
        ) : null}
        <p className="flex items-center gap-2 text-[12.5px] text-ink-3">
          <EyeOff aria-hidden className="size-3.5" />
          La foto, la edad, el género, la dirección y la nacionalidad no entran en el puntaje.
          <Link href={routes.governance} className="text-blue hover:text-ink">
            Ver auditoría
          </Link>
        </p>
      </footer>
    </article>
  );
}
