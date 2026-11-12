import { Suspense, type ReactNode } from "react";
import { getApplicant } from "@/features/candidates/api/portal";
import { PortalNav } from "@/features/candidates/components/portal/portal-nav";

async function Nav() {
  const me = await getApplicant();
  return <PortalNav name={me.name} email={me.email} />;
}

/**
 * Portal del postulante: siempre en el verde oscuro de la landing, sin
 * tarjetas de más. La empresa vive en otra app con su propia barra.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark-scope portal-light flex min-h-dvh flex-1 flex-col [--app-header:64px]">
      <Suspense fallback={<div className="h-16 border-b border-border" />}>
        <Nav />
      </Suspense>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
