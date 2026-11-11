import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTop } from "@/shared/components/layout";
import { Skeleton } from "@/shared/components/ui";
import { listRankings, listTopPeople } from "@/features/rankings/api/rankings";
import { RankingIndex } from "@/features/rankings/components/ranking-index";

export const metadata: Metadata = { title: "Ranking" };

async function Rankings() {
  const [people, vacancies] = await Promise.all([listTopPeople(), listRankings()]);
  return <RankingIndex people={people} vacancies={vacancies} />;
}

/** Portada de Ranking: elige una vacante para ver su ranking. */
export default function RankingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageTop title="Ranking" description="Las personas que mejor encajan en cada vacante, con la prueba de por qué." />
      <div className="flex flex-col px-4 sm:px-6 lg:px-12 pt-7 pb-14">
        <Suspense
          fallback={
            <div className="flex flex-col gap-8" aria-busy>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-[300px] rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-[420px] rounded-2xl" />
            </div>
          }
        >
          <Rankings />
        </Suspense>
      </div>
    </div>
  );
}
