import type { Metadata } from "next";
import { Suspense } from "react";
import { Upload } from "lucide-react";
import { ButtonLink } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { getDashboard } from "@/features/dashboard/api/dashboard";
import { DashboardSkeleton, DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Inicio" };

async function Dashboard() {
  const data = await getDashboard();
  return (
    <>
      <p className="eyebrow -mt-2 mb-1 animate-fade-in">
        {data.today}, {data.organization}
      </p>
      <DashboardView data={data} />
    </>
  );
}

/** Pantalla 04 · Inicio · Panel. La cabecera es estática; los datos llegan en streaming. */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-surface">
        <div className="flex flex-wrap items-end justify-between gap-6 px-12 pt-8 pb-7">
          <h1 className="font-head text-[34px] leading-tight font-semibold tracking-[-0.01em]">Pipeline de talento</h1>
          <div className="flex gap-2">
            <ButtonLink href={routes.candidates} variant="outline" icon={<Upload />}>
              Subir hojas de vida
            </ButtonLink>
            <ButtonLink href={routes.newVacancy}>Nueva vacante</ButtonLink>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 px-12 pt-7 pb-12">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </div>
    </div>
  );
}
