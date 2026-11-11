import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Integraciones" };

export default function IntegrationsPage() {
  return (
    <PageBody>
      <PageHeader eyebrow="BANCOLOMBIA DIGITAL" title="Fuentes y destinos" />
      <EmptyState
        title="Nada conectado todavía"
        description="Conecta Greenhouse, Lever, LinkedIn Recruiter o una carpeta compartida."
        action={<ButtonLink href={routes.integrations}>Añadir fuente</ButtonLink>}
        className="w-[480px] animate-rise"
      />
    </PageBody>
  );
}
