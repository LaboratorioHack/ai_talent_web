import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { listOpenJobs } from "@/features/candidates/api/portal";
import { JobsBrowser } from "@/features/candidates/components/portal/jobs-browser";

export const metadata: Metadata = { title: "Vacantes" };

async function Jobs() {
  const jobs = await listOpenJobs();
  return <JobsBrowser jobs={jobs} />;
}

function Loading() {
  return (
    <div className="flex flex-col gap-3" aria-busy>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

/** Portal del postulante · Vacantes abiertas. */
export default function PortalJobsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-14">
      <h1 className="font-head text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] animate-rise sm:text-[44px]">Vacantes abiertas</h1>
      <Suspense fallback={<Loading />}>
        <Jobs />
      </Suspense>
    </div>
  );
}
