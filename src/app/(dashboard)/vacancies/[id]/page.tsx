import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Pencil, Upload } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { ButtonLink, Skeleton } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { getPipeline, getVacancy } from "@/features/vacancies/api/vacancies";
import { CopyApplyLink } from "@/features/vacancies/components/copy-apply-link";
import { DeleteVacancy } from "@/features/vacancies/components/delete-vacancy";
import { PipelineBoard } from "@/features/vacancies/components/pipeline-board";

export const metadata: Metadata = { title: "Pipeline" };

async function Board({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vacancy, cards] = await Promise.all([getVacancy(id), getPipeline(id)]);
  if (!vacancy) notFound();
  const evaluations = vacancy.stats.meets + vacancy.stats.partial + vacancy.stats.doesNotMeet;
  return (
    <>
      <PageTop
        sticky={false}
        eyebrow={
          <nav aria-label="Ruta" className="flex items-center gap-1.5">
            <Link href={routes.vacancies} className="transition-colors hover:text-ink">
              Vacantes
            </Link>
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-ink-2">Pipeline</span>
          </nav>
        }
        title={vacancy.title}
        description={`${vacancy.stats.received} hojas de vida, ${vacancy.stats.meets} cumplen el perfil, ${vacancy.openings} ${vacancy.openings === 1 ? "plaza" : "plazas"}`}
        actions={
          <>
            <DeleteVacancy id={vacancy.id} title={vacancy.title} evaluations={evaluations} />
            {vacancy.status === "OPEN" ? <CopyApplyLink jobId={vacancy.id} /> : null}
            <ButtonLink href={routes.vacancyEdit(vacancy.id)} variant="outline" icon={<Pencil />}>
              Editar perfil
            </ButtonLink>
            <ButtonLink href={`${routes.candidates}?job=${vacancy.id}`} icon={<Upload />}>
              Subir hojas de vida
            </ButtonLink>
          </>
        }
      />
      <PipelineBoard jobId={vacancy.id} cards={cards} />
    </>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col" aria-busy>
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-12 pt-7 pb-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-8 w-80" />
      </div>
      <div className="grid grid-cols-5 gap-4 px-4 sm:px-6 lg:px-10 pt-6">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[420px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Pantalla 05 · Vacantes · Tablero de pipeline. */
export default function VacancyBoardPage({ params }: PageProps<"/vacancies/[id]">) {
  return (
    <div className="flex h-[calc(100dvh-var(--app-header,0px))] flex-col">
      <Suspense fallback={<BoardSkeleton />}>
        <Board params={params} />
      </Suspense>
    </div>
  );
}
