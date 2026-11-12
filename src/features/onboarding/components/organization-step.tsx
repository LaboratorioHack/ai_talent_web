"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, SelectField, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { COMPANY_SIZES, createCompany, isCompanySize, type CompanySize } from "../api/company";
import { useOnboarding } from "../state/onboarding-store";
import { StepFrame } from "./step-frame";

const SECTORS = ["Banca y finanzas", "Tecnología", "Retail", "Salud", "Educación", "Industria", "Otro"];

export interface OrganizationStepProps {
  /** Organización detectada por el dominio del correo. */
  detectedName: string;
}

/**
 * Pantalla 02 · Onboarding · Paso 2 Organización: nombre, sector y tamaño.
 * Invitar al equipo queda fuera del MVP (un reclutador, una compañía).
 */
export function OrganizationStep({ detectedName }: OrganizationStepProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data, update } = useOnboarding();
  const [name, setName] = useState(data.organization.name || detectedName);
  const [sector, setSector] = useState(data.organization.sector);
  // Un avance guardado antes de alinear los tamaños con la API puede traer uno que ya no existe.
  const [size, setSize] = useState<CompanySize>(isCompanySize(data.organization.size) ? data.organization.size : "1000+");
  const [busy, setBusy] = useState(false);

  async function next() {
    setBusy(true);
    try {
      await createCompany({ name: name.trim(), sector, size });
      update({ organization: { name: name.trim(), sector, size } });
      router.push(routes.onboarding(3));
    } catch (error) {
      toast({ tone: "error", title: "No se pudo crear la organización", description: error instanceof Error ? error.message : undefined });
    } finally {
      setBusy(false);
    }
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
          <Button disabled={!name.trim()} loading={busy} onClick={next}>
            Continuar
          </Button>
        </>
      }
    >
      <TextField label="Nombre de la organización" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} validated={name === detectedName} />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Sector" value={sector} onChange={setSector} options={SECTORS.map((s) => ({ value: s, label: s }))} />
        <SelectField label="Tamaño" value={size} onChange={(v) => isCompanySize(v) && setSize(v)} options={COMPANY_SIZES.map((s) => ({ value: s.value, label: s.label }))} />
      </div>
    </StepFrame>
  );
}
