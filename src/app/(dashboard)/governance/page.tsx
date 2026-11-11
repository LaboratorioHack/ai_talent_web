import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Gobierno IA" };

export default function GovernancePage() {
  return (
    <PageBody>
      <PageHeader eyebrow="ÚLTIMOS 30 DÍAS · BANCOLOMBIA DIGITAL" title="Qué usó y qué no usó la IA" />
      <EmptyState
        title="Sin evaluaciones en el periodo"
        description="La auditoría se llena con cada hoja de vida evaluada."
        action={<ButtonLink href={routes.vacancies}>Ver vacantes</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
