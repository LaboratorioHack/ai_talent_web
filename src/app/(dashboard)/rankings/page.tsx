import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTop } from "@/shared/components/layout";
import { Skeleton } from "@/shared/components/ui";
import { listRankings } from "@/features/rankings/api/rankings";
import { RankingIndex } from "@/features/rankings/components/ranking-index";

export const metadata: Metadata = { title: "Ranking" };

async function Rankings() {
  const rankings = await listRankings();
  return <RankingIndex rankings={rankings} />;
}

/** Portada de Ranking: elige una vacante para ver su ranking. */
export default function RankingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageTop title="Ranking" description="Elige una vacante para ver a sus candidatos ordenados por ajuste al perfil." />
      <div className="flex flex-col px-12 pt-7 pb-14">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3" aria-busy>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-2xl" />
              ))}
            </div>
          }
        >
          <Rankings />
        </Suspense>
      </div>
    </div>
  );
}
