import { Suspense, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { getApplicant } from "@/features/candidates/api/portal";
import { PortalNav } from "@/features/candidates/components/portal/portal-nav";

async function Nav() {
  const me = await getApplicant();
  return <PortalNav name={me.name} email={me.email} />;
}

/** Portal del postulante: su propia barra, sin nada de la empresa. */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col [--app-header:64px]">
      <Suspense fallback={<div className="h-16 border-b border-border/80" />}>
        <Nav />
      </Suspense>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border">
        <p className="mx-auto flex w-full max-w-[1160px] items-start gap-2 px-4 py-5 text-[12.5px] text-ink-3 sm:px-6 lg:px-8">
          <ShieldCheck aria-hidden className="mt-px size-3.5 shrink-0" />
          Nadie decide solo con la IA, y la IA nunca recibe tu nombre, tu foto ni tus datos personales.
        </p>
      </footer>
    </div>
  );
}
