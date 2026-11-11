import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PageBody, PageHeader } from "@/shared/components/layout";
import { ButtonLink, Skeleton } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { listVacancies } from "@/features/vacancies/api/vacancies";
import { VacancyList } from "@/features/vacancies/components/vacancy-list";

export const metadata: Metadata = { title: "Vacantes" };

async function Vacancies() {
  const vacancies = await listVacancies();
  return <VacancyList vacancies={vacancies} />;
}

function VacanciesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3" aria-busy>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-[210px] rounded-2xl" />
      ))}
    </div>
  );
}

/** Lista de vacantes de la organización. */
export default function VacanciesPage() {
  return (
    <PageBody>
      <PageHeader title="Vacantes" description="Cada vacante tiene su perfil de cargo, sus hojas de vida y su ranking." actions={<ButtonLink href={routes.newVacancy} icon={<Plus />}>Nueva vacante</ButtonLink>} />
      <Suspense fallback={<VacanciesSkeleton />}>
        <Vacancies />
      </Suspense>
    </PageBody>
  );
}
