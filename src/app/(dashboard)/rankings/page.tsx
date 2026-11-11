import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Ranking IA" };

export default function RankingsPage() {
  return (
    <PageBody>
      <PageHeader eyebrow="ELIGE UNA VACANTE" title="Ranking" />
      <EmptyState
        title="Sin evaluaciones aún"
        description="Elige una vacante con hojas de vida y pulsa Evaluar."
        action={<ButtonLink href={routes.vacancies}>Ver vacantes</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
