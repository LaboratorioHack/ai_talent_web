import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTopSkeleton } from "@/shared/components/layout";
import { Skeleton } from "@/shared/components/ui";
import { getIngest } from "@/features/cv-upload/api/ingest";
import { IngestView } from "@/features/cv-upload/components/ingest-view";

export const metadata: Metadata = { title: "Hojas de vida" };

async function Ingest({ searchParams }: { searchParams: Promise<{ job?: string | string[] }> }) {
  const { job } = await searchParams;
  const data = await getIngest(typeof job === "string" ? job : undefined);
  return <IngestView key={data.job.id} data={data} />;
}

function IngestSkeleton() {
  return (
    <div className="flex flex-col" aria-busy>
      <PageTopSkeleton />
      <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-12 pt-7">
        <Skeleton className="h-[182px] rounded-2xl" />
        <Skeleton className="h-[86px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </div>
  );
}

/** Pantalla 07 · Candidatos · Ingesta. La vacante llega por ?job=. */
export default function CandidatesPage({ searchParams }: PageProps<"/candidates">) {
  return (
    <Suspense fallback={<IngestSkeleton />}>
      <Ingest searchParams={searchParams} />
    </Suspense>
  );
}
