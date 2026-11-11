"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Check, Folder, Upload, UserSearch, type LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { StepFrame } from "./step-frame";

interface Source {
  id: string;
  name: string;
  detail: string;
  icon: LucideIcon;
}

const SOURCES: Source[] = [
  { id: "upload", name: "Subir archivos", detail: "PDF, DOCX, imágenes o escaneos, con cualquier estructura de CV", icon: Upload },
  { id: "greenhouse", name: "Greenhouse", detail: "Importa postulantes de tus vacantes abiertas", icon: Briefcase },
  { id: "lever", name: "Lever", detail: "Sincroniza candidatos y etapas", icon: Briefcase },
  { id: "linkedin", name: "LinkedIn Recruiter", detail: "Vía MCP · solo perfiles que te autorizaron", icon: UserSearch },
  { id: "drive", name: "Carpeta compartida", detail: "Google Drive o SharePoint", icon: Folder },
];

/** Pantalla 03 · Onboarding · Paso 3 Fuentes. */
export function SourcesStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["upload", "greenhouse"]));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <StepFrame
      step={3}
      title="¿De dónde llegan las hojas de vida?"
      description="Elige una o varias. Puedes cambiarlo después en Integraciones."
      width={780}
      bare
      footer={
        <>
          <Button variant="text" icon={<ArrowLeft />} onClick={() => router.push(routes.onboarding(2))}>
            Atrás
          </Button>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.push(routes.onboarding(4))} className="text-sm text-ink-2 transition-colors hover:text-ink">
              Omitir por ahora
            </button>
            <Button disabled={selected.size === 0} onClick={() => router.push(routes.onboarding(4))}>
              Continuar
            </Button>
          </div>
        </>
      }
    >
      <div className="stagger grid grid-cols-2 gap-3 [&>*]:animate-rise" role="group" aria-label="Fuentes">
        {SOURCES.map((source, i) => {
          const on = selected.has(source.id);
          const Icon = source.icon;
          return (
            <button
              key={source.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(source.id)}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "flex items-center gap-3.5 rounded-lg border p-[18px] text-left transition-[border-color,background-color,transform,box-shadow] duration-300 ease-[var(--ease-out-soft)]",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(21,32,27,0.45)]",
                on ? "border-ink bg-surface" : "border-border bg-transparent",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                <Icon aria-hidden className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-md font-medium">{source.name}</span>
                <span className="text-[12.5px] text-ink-2">{source.detail}</span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-spring)]",
                  on ? "scale-100 border-ink bg-ink text-ink-inverse" : "scale-90 border-border",
                )}
              >
                <Check className={cn("size-3 transition-opacity duration-200", on ? "opacity-100" : "opacity-0")} />
              </span>
            </button>
          );
        })}
      </div>
    </StepFrame>
  );
}
