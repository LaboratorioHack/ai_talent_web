import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/components/ui";
import { getRanking } from "@/features/rankings/api/rankings";
import { RankingView } from "@/features/rankings/components/ranking-view";

export const metadata: Metadata = { title: "Ranking" };

async function Ranking({ params, searchParams }: PageProps<"/rankings/[jobId]">) {
  const [{ jobId }, query] = await Promise.all([params, searchParams]);
  const data = await getRanking(jobId);
  if (!data) notFound();
  const candidate = typeof query.candidate === "string" ? query.candidate : undefined;
  const evaluating = typeof query.evaluando === "string" ? Number(query.evaluando) || 0 : 0;
  return <RankingView key={data.job.id} data={data} initialCandidate={candidate} evaluating={evaluating} />;
}

function RankingSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-busy>
      <div className="border-b border-border bg-surface px-12 pt-6 pb-5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-8 w-80" />
      </div>
      <div className="grid flex-1 grid-cols-[440px_1fr]">
        <div className="flex flex-col gap-3 border-r border-border px-6 pt-6">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
        <div className="flex flex-col gap-6 bg-surface px-12 pt-8">
          <Skeleton className="h-20 w-2/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[360px] w-full" />
        </div>
      </div>
    </div>
  );
}

/** Pantallas 08, 12, 14 y 15 · Ranking IA de una vacante. */
export default function RankingPage(props: PageProps<"/rankings/[jobId]">) {
  return (
    <Suspense fallback={<RankingSkeleton />}>
      <Ranking {...props} />
    </Suspense>
  );
}
