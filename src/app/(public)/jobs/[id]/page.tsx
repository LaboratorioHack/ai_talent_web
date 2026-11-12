import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/components/ui";
import { getPublicJob } from "@/features/candidates/api/public";
import { PublicJobView } from "@/features/candidates/components/public-job-view";

export const metadata: Metadata = { title: "Postúlate" };

async function Job({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJob(id);
  if (!job) notFound();
  return <PublicJobView job={job} />;
}

function JobSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-8 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8" aria-busy>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-[260px] w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[520px] rounded-2xl" />
    </div>
  );
}

/** Pantalla 16 · Vacante pública con postulación (candidato, sin sesión). */
export default function PublicJobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <Suspense fallback={<JobSkeleton />}>
      <Job params={params} />
    </Suspense>
  );
}
