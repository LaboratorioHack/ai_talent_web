import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Inicio" };

export default function HomePage() {
  return (
    <PageBody>
      <PageHeader eyebrow="MIÉRCOLES 11 DE NOVIEMBRE · BANCOLOMBIA DIGITAL" title="Pipeline de talento" />
      <EmptyState
        title="Todavía no hay actividad"
        description="Crea tu primera vacante o sube hojas de vida para empezar."
        action={<ButtonLink href={routes.newVacancy}>Nueva vacante</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
