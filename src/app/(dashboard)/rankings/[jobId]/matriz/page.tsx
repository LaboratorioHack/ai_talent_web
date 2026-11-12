import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageTopSkeleton } from "@/shared/components/layout";
import { Skeleton } from "@/shared/components/ui";
import { getTradeoffs } from "@/features/rankings/api/tradeoffs";
import { TradeoffMatrix } from "@/features/rankings/components/tradeoff-matrix";

export const metadata: Metadata = { title: "Matriz de trade-offs" };

async function Matrix({ params }: PageProps<"/rankings/[jobId]/matriz">) {
  const { jobId } = await params;
  const data = await getTradeoffs(jobId);
  if (!data) notFound();
  return <TradeoffMatrix key={data.job.id} data={data} />;
}

function MatrixSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-busy>
      <PageTopSkeleton />
      <div className="flex flex-col gap-6 px-4 pt-7 sm:px-6 lg:px-12">
        <Skeleton className="h-[72px] rounded-2xl" />
        <Skeleton className="h-[720px] rounded-2xl" />
      </div>
    </div>
  );
}

/** Ranking · Matriz de trade-offs de una vacante (hasta 4 personas lado a lado). */
export default function TradeoffsPage(props: PageProps<"/rankings/[jobId]/matriz">) {
  return (
    <Suspense fallback={<MatrixSkeleton />}>
      <Matrix {...props} />
    </Suspense>
  );
}
