"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Grid2x2, Inbox, Link2 } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { ButtonLink, EmptyState, Select, useToast, CribaAi } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { formatShortDate } from "@/shared/lib/dates";
import type { RankingData } from "../types/ranking";
import { CandidateFocus } from "./candidate-focus";
import { EvaluatingPanel } from "./evaluating-panel";
import { AiErrorModal, DiscardModal, EquivalencesModal, InvitedModal, InviteModal, ResumeModal } from "./ranking-modals";
import { RankingList } from "./ranking-list";

const without = (map: Record<string, string>, id: string) => {
  const next = { ...map };
  delete next[id];
  return next;
};

type ModalKind = "invite" | "invited" | "discard" | "aiError" | "equiv" | "resume" | null;

export interface RankingViewProps {
  data: RankingData;
  initialCandidate?: string;
  /** Llega de "Evaluar ahora": muestra la pantalla 14 con este total. */
  evaluating?: number;
}

/** Pantallas 08, 12, 14 y 15 · Ranking de una vacante con foco en un candidato. */
export function RankingView({ data, initialCandidate, evaluating: initialEvaluating }: RankingViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState(data.requirements);
  const [selectedId, setSelectedId] = useState(initialCandidate && data.candidates.some((c) => c.id === initialCandidate) ? initialCandidate : (data.candidates[0]?.id ?? null));
  const [discarded, setDiscarded] = useState<Record<string, string>>({});
  const [invited, setInvited] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ModalKind>(null);
  const [requirementId, setRequirementId] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [evaluating, setEvaluating] = useState(initialEvaluating ?? 0);

  const selected = data.candidates.find((c) => c.id === selectedId) ?? null;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `?candidate=${id}`);
  }, []);

  const finishEvaluation = useCallback(() => {
    setEvaluating(0);
    window.history.replaceState(null, "", "?");
    toast({ title: `${data.candidates.length} hojas de vida evaluadas`, description: "El ranking ya está ordenado por ajuste al perfil." });
  }, [data.candidates.length, toast]);

  function discard(reason: string) {
    if (!selected) return;
    const who = selected;
    setDiscarded((d) => ({ ...d, [who.id]: reason }));
    setModal(null);
    toast({
      title: `Descartaste a ${who.name}`,
      description: "Motivo guardado en la auditoría.",
      action: { label: "Deshacer", onClick: () => setDiscarded((d) => without(d, who.id)) },
    });
  }

  function nextToInvite() {
    const next = data.candidates.find((c) => c.id !== selectedId && !invited[c.id] && !discarded[c.id] && c.fulfillment === "MEETS");
    setModal(null);
    if (next) {
      select(next.id);
      window.setTimeout(() => setModal("invite"), 380);
    }
  }

  const evaluated = data.candidates.length;
  const top = (
    <PageTop
      eyebrow={
        <nav aria-label="Ruta" className="flex items-center gap-1.5">
          <Link href={routes.rankings} className="transition-colors hover:text-ink">
            Ranking
          </Link>
          <ChevronRight aria-hidden className="size-3.5" />
          <span className="text-ink-2">Cierra el {formatShortDate(new Date(`${data.job.closesAt}T12:00:00`))}</span>
        </nav>
      }
      title={data.job.title}
      description={
        evaluated ? (
          <span className="flex flex-wrap items-center gap-2">
            {evaluated} evaluadas, ordenadas por ajuste al perfil
            <CribaAi label="Evaluó y ordenó; tu equipo decide" />
          </span>
        ) : (
          "Sin evaluaciones todavía"
        )
      }
      actions={
        <>
          <Select aria-label="Vacante" options={data.jobs} value={data.job.id} onChange={(id) => router.push(routes.ranking(id))} className="w-full sm:w-[280px]" />
          {evaluated ? (
            <ButtonLink href={routes.tradeoffs(data.job.id)} variant="outline" icon={<Grid2x2 />}>
              Ver matriz
            </ButtonLink>
          ) : null}
          <ButtonLink href={`${routes.candidates}?job=${data.job.id}`} variant="outline" icon={<Inbox />}>
            Ver postulaciones
          </ButtonLink>
        </>
      }
    />
  );

  if (!evaluated) {
    return (
      <div className="flex flex-1 flex-col">
        {top}
        <div className="flex flex-1 flex-col px-4 sm:px-6 lg:px-12 py-16">
          <EmptyState
            title="Todavía no hay candidatos"
            description="Comparte el enlace para que las personas se postulen. Criba AI evalúa cada hoja de vida con el perfil de esta vacante apenas llega."
            action={
              <ButtonLink href={`${routes.candidates}?job=${data.job.id}`} icon={<Link2 />}>
                Compartir el enlace
              </ButtonLink>
            }
            alternative={
              <Link href={routes.apply(data.job.id)} target="_blank">
                o abrir el enlace de postulación
              </Link>
            }
            className="animate-rise"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {top}
      <div className="mt-4 grid flex-1 grid-cols-1 border-t border-border lg:grid-cols-[440px_1fr]">
        <aside className="max-h-[48vh] overflow-y-auto overscroll-contain border-b border-border bg-bg px-3 pt-4 pb-6 sm:px-6 lg:sticky lg:top-[calc(var(--app-header,0px)+76px)] lg:h-[calc(100dvh-var(--app-header,0px)-76px)] lg:max-h-none lg:self-start lg:border-r lg:border-b-0 lg:pt-6 lg:pb-10">
          <RankingList candidates={data.candidates} selectedId={selectedId} onSelect={select} discarded={discarded} dimmed={evaluating > 0} />
        </aside>
        <section className="flex min-w-0 flex-col bg-surface px-4 pt-6 pb-14 sm:px-6 sm:pt-8 lg:px-12">
          {evaluating > 0 ? (
            <EvaluatingPanel
              total={evaluating}
              onDone={finishEvaluation}
              onCancelled={(done) => {
                setEvaluating(0);
                window.history.replaceState(null, "", "?");
                toast({ title: "Evaluación cancelada", description: `Se conservaron ${done} evaluaciones; el resto quedó sin evaluar.` });
              }}
            />
          ) : selected ? (
            <CandidateFocus
              candidate={selected}
              requirements={requirements}
              profileVersion={data.job.profileVersion}
              discarded={discarded[selected.id]}
              invited={invited[selected.id]}
              onInvite={() => setModal("invite")}
              onDiscard={() => setModal("discard")}
              onRestore={() => setDiscarded((d) => without(d, selected.id))}
              onOpenResume={() => setModal("resume")}
              onAiError={(id) => {
                setRequirementId(id);
                setModal("aiError");
              }}
              onEquivalences={(id) => {
                setRequirementId(id);
                setModal("equiv");
              }}
            />
          ) : null}
        </section>
      </div>

      <InviteModal
        candidate={selected}
        open={modal === "invite"}
        onClose={() => setModal(null)}
        onSent={(d) => {
          if (selected) setInvited((m) => ({ ...m, [selected.id]: formatShortDate(d) }));
          setDeadline(d);
          setModal("invited");
        }}
      />
      <InvitedModal name={selected?.name ?? ""} deadline={deadline} open={modal === "invited"} onClose={() => setModal(null)} onNext={nextToInvite} />
      <DiscardModal candidate={selected} open={modal === "discard"} onClose={() => setModal(null)} onDiscard={discard} />
      <AiErrorModal
        candidate={selected}
        requirements={requirements}
        requirementId={requirementId}
        open={modal === "aiError"}
        onClose={() => setModal(null)}
        onSaved={() => {
          setModal(null);
          toast({ title: "Corrección guardada", description: "Queda en Gobierno IA y ajusta las próximas evaluaciones." });
        }}
      />
      <EquivalencesModal
        requirement={requirements.find((r) => r.id === requirementId) ?? null}
        open={modal === "equiv"}
        onClose={() => setModal(null)}
        onSaved={(list) => {
          setRequirements((rs) => rs.map((r) => (r.id === requirementId ? { ...r, equivalences: list } : r)));
          setModal(null);
          toast({ title: "Equivalencias guardadas", description: "Se aplican a las próximas evaluaciones de la organización." });
        }}
      />
      <ResumeModal candidate={selected} open={modal === "resume"} onClose={() => setModal(null)} />
    </div>
  );
}
