import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/components/ui";
import { draftFromVacancy, getVacancy } from "@/features/vacancies/api/vacancies";
import { VacancyProfileForm } from "@/features/vacancies/components/vacancy-profile-form";

export const metadata: Metadata = { title: "Perfil de cargo" };

async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vacancy = await getVacancy(id);
  if (!vacancy) notFound();
  return <VacancyProfileForm id={vacancy.id} initial={draftFromVacancy(vacancy)} />;
}

/** Pantalla 06 · Perfil de cargo, editar una vacante. */
export default function VacancyProfilePage({ params }: PageProps<"/vacancies/[id]/profile">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 px-12 pt-10" aria-busy>
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-[320px] rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      }
    >
      <Profile params={params} />
    </Suspense>
  );
}
