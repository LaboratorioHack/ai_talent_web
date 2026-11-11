import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Entrevista IA" };

export default function InterviewsPage() {
  return (
    <PageBody>
      <PageHeader eyebrow="ÚLTIMOS 30 DÍAS" title="Entrevistas" />
      <EmptyState
        title="Ninguna entrevista todavía"
        description="Invita a entrevista desde el ranking para que el agente haga 5 a 10 preguntas."
        action={<ButtonLink href={routes.rankings}>Ir al ranking</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
