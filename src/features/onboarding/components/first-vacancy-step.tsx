"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { RoleProfileDraft } from "@/features/vacancies/schemas/role-profile";
import { RoleProfileEditor } from "@/features/vacancies/components";
import { createVacancy } from "@/features/vacancies/api/role-profiles";

/**
 * Pantalla 04 · Onboarding · Paso 4 Primera vacante.
 * Compone el editor de la feature `vacancies`; vive en `onboarding` porque la
 * navegación y los textos son los del flujo de alta.
 */
export function FirstVacancyStep({ initial }: { initial: RoleProfileDraft }) {
  const router = useRouter();
  const { toast } = useToast();

  async function save(draft: RoleProfileDraft) {
    const { id } = await createVacancy(draft);
    toast({ title: "Vacante guardada", description: "Puedes seguir editándola desde Vacantes." });
    router.push(routes.vacancy(id));
  }

  async function evaluate(draft: RoleProfileDraft) {
    const { id } = await createVacancy(draft);
    toast({ tone: "progress", title: "Listo para evaluar", description: "Sube las hojas de vida y Criba empieza.", duration: 4000 });
    router.push(`${routes.candidates}?job=${id}`);
  }

  return <RoleProfileEditor initial={initial} eyebrow="Paso 4 de 4 · Puedes pegar la descripción del cargo y Criba propone los requisitos" onSave={save} onEvaluate={evaluate} />;
}
