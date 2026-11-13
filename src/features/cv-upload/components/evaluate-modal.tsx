"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { env } from "@/config/env";
import { evaluationErrorMessage } from "@/features/evaluations/api/errors";
import { rankVacancy } from "@/features/evaluations/api/evaluations";
import { Button, CribaAiNote, Modal, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export interface EvaluateModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  readable: number;
  skipped: number;
  requirements: number;
}

/** "Evaluar N hojas de vida": qué entra, qué se omite y cuánto tarda, antes de lanzar. */
export function EvaluateModal({ open, onClose, jobId, readable, skipped, requirements }: EvaluateModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const minutes = Math.max(1, Math.round((readable * 90) / 60));

  const rows = [
    { label: "Hojas de vida legibles", value: String(readable), tone: "text-ink" },
    { label: "Se omiten (ilegibles, duplicadas o rechazadas)", value: String(skipped), tone: skipped ? "text-warning" : "text-ink-3" },
    { label: "Tiempo estimado", value: env.useMocks ? `unos ${Math.max(1, Math.round(readable * 1.5 / 60))} min` : `unos ${minutes} min`, tone: "text-ink" },
    { label: "Foto, edad, género y dirección", value: "se borran antes", tone: "text-success" },
  ];

  async function start() {
    if (!readable) return;
    setBusy(true);
    if (env.useMocks) {
      router.push(`${routes.ranking(jobId)}?evaluando=${readable}`);
      return;
    }
    try {
      const result = await rankVacancy(jobId);
      const evaluated = result.ranked.length;
      toast({
        title: evaluated ? `${evaluated} hojas de vida evaluadas` : "Evaluación terminada",
        description: result.notRanked.length
          ? `${result.notRanked.length} no se pudieron evaluar (aún se están leyendo).`
          : "El ranking ya está ordenado por ajuste al perfil.",
      });
      onClose();
      router.push(routes.ranking(jobId));
      router.refresh();
    } catch (error) {
      toast({ tone: "error", title: "No se pudo evaluar", description: evaluationErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={`Evaluar ${readable} hojas de vida`}
      description="Puedes salir mientras tanto; te avisamos al terminar."
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Ahora no
          </Button>
          <Button icon={<Play />} loading={busy} onClick={start} disabled={!readable}>
            Evaluar ahora
          </Button>
        </>
      }
    >
      <CribaAiNote>Compara cada hoja de vida con los {requirements} requisitos del perfil y cita la línea que prueba cada uno. Ordena el ranking; la decisión es de tu equipo.</CribaAiNote>
      <dl className="overflow-hidden rounded-xl border border-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-[13.5px] last:border-0">
            <dt className="text-ink-2">{r.label}</dt>
            <dd className={`font-mono text-[13px] font-medium ${r.tone}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
