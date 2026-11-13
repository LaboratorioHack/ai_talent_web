"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, SelectField, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { COMPANY_SIZES, companyErrorMessage, createCompany, isCompanySize, joinCompany, type CompanySize } from "../api/company";
import { useOnboarding } from "../state/onboarding-store";
import { StepFrame } from "./step-frame";

const SECTORS = ["Banca y finanzas", "Tecnología", "Retail", "Salud", "Educación", "Industria", "Otro"];

export interface OrganizationStepProps {
  /** Organización detectada por el dominio del correo; null si es un correo personal. */
  detectedName: string | null;
  /** Nombre que ya traía la cuenta (cuentas antiguas); vacío si entró por primera vez con el enlace. */
  suggestedPersonName: string;
}

/**
 * Pantalla 02 · Onboarding · Paso 2 Organización: tu nombre y el nombre, sector y tamaño de la
 * organización, o un código para unirte a una que ya existe.
 */
export function OrganizationStep({ detectedName, suggestedPersonName }: OrganizationStepProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data, update, finish } = useOnboarding();
  const [yourName, setYourName] = useState(suggestedPersonName);
  const [name, setName] = useState(data.organization.name || detectedName || "");
  const [sector, setSector] = useState(data.organization.sector || SECTORS[0]);
  // Un avance guardado antes de alinear los tamaños con la API puede traer uno que ya no existe.
  const [size, setSize] = useState<CompanySize>(isCompanySize(data.organization.size) ? data.organization.size : "1000+");
  const [busy, setBusy] = useState(false);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  /** Quien llega con código se une como reclutador y no crea otra organización. */
  async function join() {
    setBusy(true);
    setJoinError(null);
    const result = await joinCompany(code, yourName.trim());
    if (result.ok) {
      finish();
      toast({ title: "Te uniste a la organización" });
      router.push(routes.home);
      return;
    }
    setJoinError(result.message);
    setBusy(false);
  }

  async function next() {
    setBusy(true);
    try {
      await createCompany({ name: name.trim(), sector, size, yourName: yourName.trim() });
      update({ organization: { name: name.trim(), sector, size } });
      router.push(routes.onboarding(3));
    } catch (error) {
      toast({ tone: "error", title: "No se pudo crear la organización", description: companyErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <StepFrame
      step={2}
      title="¿Para qué organización reclutas?"
      description={detectedName ? `Detectamos ${detectedName} por tu correo. Puedes cambiarlo.` : "Así aparecerá en tus vacantes públicas."}
      footer={
        <Button disabled={!name.trim() || !yourName.trim() || joining} loading={busy && !joining} onClick={next} className="ml-auto">
          Continuar
        </Button>
      }
    >
      <TextField label="Tu nombre" value={yourName} maxLength={120} autoComplete="name" onChange={(e) => setYourName(e.target.value)} help="Así te verá tu equipo en Criba." />
      <TextField label="Nombre de la organización" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} validated={!!detectedName && name === detectedName} />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Sector" value={sector} onChange={setSector} options={SECTORS.map((s) => ({ value: s, label: s }))} />
        <SelectField label="Tamaño" value={size} onChange={(v) => isCompanySize(v) && setSize(v)} options={COMPANY_SIZES.map((s) => ({ value: s.value, label: s.label }))} />
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-5">
        {joining ? (
          <>
            <TextField label="Código de invitación" value={code} onChange={(e) => setCode(e.target.value)} error={joinError ?? undefined} autoComplete="off" help="Te lo comparte quien administra tu organización. Vence a los 7 días." />
            <div className="flex justify-end gap-2">
              <Button variant="text" disabled={busy} onClick={() => setJoining(false)}>
                Cancelar
              </Button>
              <Button variant="outline" disabled={!code.trim() || !yourName.trim()} loading={busy} onClick={join}>
                Unirme a la organización
              </Button>
            </div>
          </>
        ) : (
          <Button variant="text" className="self-start" onClick={() => setJoining(true)}>
            Me invitaron: tengo un código
          </Button>
        )}
      </div>
    </StepFrame>
  );
}
