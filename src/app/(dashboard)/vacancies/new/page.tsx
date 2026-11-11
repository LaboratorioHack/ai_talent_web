import type { Metadata } from "next";
import { VacancyProfileForm } from "@/features/vacancies/components/vacancy-profile-form";
import { emptyRoleProfileDraft } from "@/features/vacancies/api/role-profiles";

export const metadata: Metadata = { title: "Nueva vacante" };

/** Pantalla 06 · Perfil de cargo, vacante nueva. */
export default function NewVacancyPage() {
  return <VacancyProfileForm initial={emptyRoleProfileDraft()} />;
}
