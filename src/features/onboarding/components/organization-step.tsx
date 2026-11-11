"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, SelectField, TextField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { useOnboarding } from "../state/onboarding-store";
import { StepFrame } from "./step-frame";

const SECTORS = ["Banca y finanzas", "Tecnología", "Retail", "Salud", "Educación", "Industria", "Otro"];
const SIZES = ["1–50", "51–200", "201–1.000", "1.001–5.000", "Más de 5.000"];

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
  const { data, update } = useOnboarding();
  const [name, setName] = useState(data.organization.name || detectedName);
  const [sector, setSector] = useState(data.organization.sector);
  const [size, setSize] = useState(data.organization.size);

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
          <Button disabled={!name.trim()} onClick={() => {
              update({ organization: { name: name.trim(), sector, size } });
              router.push(routes.onboarding(3));
            }}>
            Continuar
          </Button>
        </>
      }
    >
      <TextField label="Nombre de la organización" value={name} onChange={(e) => setName(e.target.value)} validated={name === detectedName} />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Sector" value={sector} onChange={setSector} options={SECTORS.map((s) => ({ value: s, label: s }))} />
        <SelectField label="Tamaño" value={size} onChange={setSize} options={SIZES.map((s) => ({ value: s, label: s }))} />
      </div>
    </StepFrame>
  );
}
