import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { listOpenJobs } from "@/features/candidates/api/portal";
import { JobsBrowser } from "@/features/candidates/components/portal/jobs-browser";
import { PortalTitle } from "@/features/candidates/components/portal/portal-title";

export const metadata: Metadata = { title: "Vacantes" };

async function Jobs() {
  const jobs = await listOpenJobs();
  return <JobsBrowser jobs={jobs} />;
}

function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-[210px] rounded-2xl" />
        ))}
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

/** Portal del postulante · Vacantes: las que Criba AI elige para ti y todas las abiertas. */
export default function PortalJobsPage() {
  return (
    <>
      <PortalTitle>
        Vacantes <span className="hl">abiertas</span>
      </PortalTitle>
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 pt-6 pb-20 sm:px-6 lg:px-8">
        <Suspense fallback={<Loading />}>
          <Jobs />
        </Suspense>
      </div>
    </>
  );
}
