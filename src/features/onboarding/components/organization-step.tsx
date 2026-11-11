"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Button, SelectField, TextField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { StepFrame } from "./step-frame";

const SECTORS = ["Banca y finanzas", "Tecnología", "Retail", "Salud", "Educación", "Industria", "Otro"];
const SIZES = ["1–50", "51–200", "201–1.000", "1.001–5.000", "Más de 5.000"];

export interface OrganizationStepProps {
  /** Organización detectada por el dominio del correo. */
  detectedName: string;
}

/** Pantalla 02 · Onboarding · Paso 2 Organización. */
export function OrganizationStep({ detectedName }: OrganizationStepProps) {
  const router = useRouter();
  const [name, setName] = useState(detectedName);
  const [sector, setSector] = useState("Banca y finanzas");
  const [size, setSize] = useState("1.001–5.000");
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  function addEmail() {
    const value = draft.trim().toLowerCase();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Escribe un correo válido");
      return;
    }
    if (!emails.includes(value)) setEmails((e) => [...e, value]);
    setDraft("");
    setEmailError(undefined);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail();
    }
    if (e.key === "Backspace" && !draft && emails.length) setEmails((list) => list.slice(0, -1));
  }

  return (
    <StepFrame
      step={2}
      title="¿Para qué organización reclutas?"
      description={`Detectamos ${detectedName} por tu correo. Puedes cambiarlo.`}
      footer={
        <>
          <Button variant="text" icon={<ArrowLeft />} onClick={() => router.push(routes.login)}>
            Atrás
          </Button>
          <Button disabled={!name.trim()} onClick={() => router.push(routes.onboarding(3))}>
            Continuar
          </Button>
        </>
      }
    >
      <TextField label="Nombre de la organización" value={name} onChange={(e) => setName(e.target.value)} validated={name === detectedName} />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} options={SECTORS.map((s) => ({ value: s, label: s }))} />
        <SelectField label="Tamaño" kind="Personas" value={size} onChange={(e) => setSize(e.target.value)} options={SIZES.map((s) => ({ value: s, label: s }))} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="invite" className="text-sm font-medium">
            Invita a tu equipo
          </label>
          <span className="text-[11px] text-ink-3">Opcional · correos</span>
        </div>
        <div
          className={cn(
            "flex min-h-10 flex-wrap items-center gap-2 rounded-md border bg-surface px-2.5 py-2 transition-colors focus-within:border-ink",
            emailError ? "border-danger" : "border-border",
          )}
        >
          {emails.map((email) => (
            <span key={email} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-1.5 pl-2 text-xs animate-pop-in">
              {email}
              <button type="button" aria-label={`Quitar ${email}`} onClick={() => setEmails((l) => l.filter((e) => e !== email))} className="text-ink-3 transition-colors hover:text-danger">
                <X aria-hidden className="size-[11px]" />
              </button>
            </span>
          ))}
          <input
            id="invite"
            type="email"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setEmailError(undefined);
            }}
            onKeyDown={onKey}
            onBlur={addEmail}
            placeholder={emails.length ? "" : "añadir correo…"}
            className="min-w-[160px] flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3"
          />
        </div>
        <p className={cn("text-xs", emailError ? "text-danger" : "text-ink-2")}>{emailError ?? "Entrarán como reclutadores; puedes cambiar roles después"}</p>
      </div>
    </StepFrame>
  );
}
