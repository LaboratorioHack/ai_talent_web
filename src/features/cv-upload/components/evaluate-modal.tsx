"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { Button, CribaAiNote, Modal } from "@/shared/components/ui";
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
  const [busy, setBusy] = useState(false);
  const minutes = Math.max(1, Math.round((readable * 90) / 60));

  const rows = [
    { label: "Hojas de vida legibles", value: String(readable), tone: "text-ink" },
    { label: "Se omiten (ilegibles, duplicadas o rechazadas)", value: String(skipped), tone: skipped ? "text-warning" : "text-ink-3" },
    { label: "Tiempo estimado", value: `unos ${minutes} min`, tone: "text-ink" },
    { label: "Foto, edad, género y dirección", value: "se borran antes", tone: "text-success" },
  ];

  /** El ranking evalúa en el servidor y muestra lo que ya quedó guardado mientras avanza. */
  function start() {
    if (!readable) return;
    setBusy(true);
    router.push(`${routes.ranking(jobId)}?evaluando=${readable}`);
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
