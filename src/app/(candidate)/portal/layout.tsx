import { Suspense, type ReactNode } from "react";
import { getApplicant, listMyApplications } from "@/features/candidates/api/portal";
import { PortalNav } from "@/features/candidates/components/portal/portal-nav";
import { CribaAssistant } from "@/features/assistant/components/criba-assistant";

async function Nav() {
  const [me, applications] = await Promise.all([getApplicant(), listMyApplications()]);
  const open = applications.filter((a) => a.outcome === "open");
  return <PortalNav name={me.name} email={me.email} active={open.length} pending={open.some((a) => a.interviewToken)} />;
}

/**
 * Portal del postulante: su propia barra, luz y contornos de fondo
 * (`.portal-light`), en claro u oscuro según el interruptor.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="portal-light flex min-h-dvh flex-1 flex-col [--app-header:68px]">
      <Suspense fallback={<div className="h-[68px] border-b border-border" />}>
        <Nav />
      </Suspense>
      <main className="flex flex-1 flex-col">{children}</main>
      <CribaAssistant audience="applicant" />
    </div>
  );
}
