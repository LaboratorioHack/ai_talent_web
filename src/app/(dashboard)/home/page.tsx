import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus, Upload } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { ButtonLink, LiveClock } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { getDashboard } from "@/features/dashboard/api/dashboard";
import { DashboardSkeleton, DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Inicio" };

async function Dashboard() {
  const data = await getDashboard();
  return <DashboardView data={data} />;
}

/** Pantalla 04 · Inicio · Panel. La cabecera es estática y fija; los datos llegan en streaming. */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageTop
        eyebrow={<LiveClock />}
        title="Pipeline de talento"
        actions={
          <>
            <ButtonLink href={routes.candidates} variant="outline" icon={<Upload />}>
              Subir hojas de vida
            </ButtonLink>
            <ButtonLink href={routes.newVacancy} icon={<Plus />}>
              Nueva vacante
            </ButtonLink>
          </>
        }
      />
      <div className="flex flex-col gap-5 px-12 pt-7 pb-14">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </div>
    </div>
  );
}
