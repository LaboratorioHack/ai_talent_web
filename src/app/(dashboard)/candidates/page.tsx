import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Candidatos" };

export default function CandidatesPage() {
  return (
    <PageBody>
      <PageHeader eyebrow="TODAS LAS VACANTES" title="Hojas de vida" />
      <EmptyState
        title="Todavía no hay candidatos"
        description="Sube hojas de vida o conecta tu ATS para empezar."
        action={<ButtonLink href={routes.candidates}>Subir hojas de vida</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
