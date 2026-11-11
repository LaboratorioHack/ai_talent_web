import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Vacantes" };

export default function VacanciesPage() {
  return (
    <PageBody>
      <PageHeader eyebrow="BANCOLOMBIA DIGITAL" title="Vacantes" />
      <EmptyState
        title="Todavía no hay vacantes"
        description="Crea la primera y Criba propone los requisitos desde la descripción del cargo."
        action={<ButtonLink href={routes.newVacancy}>Nueva vacante</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
