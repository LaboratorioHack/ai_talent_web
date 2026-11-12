import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { getApplicant, getMyResume, listMyApplications, listOpenJobs } from "@/features/candidates/api/portal";
import { PortalHome } from "@/features/candidates/components/portal/portal-home";

export const metadata: Metadata = { title: "Mis postulaciones" };

async function Home() {
  const [applicant, applications, jobs, resume] = await Promise.all([getApplicant(), listMyApplications(), listOpenJobs(), getMyResume()]);
  return <PortalHome applicant={applicant} applications={applications} resume={resume} jobs={jobs} />;
}

function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-12 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8" aria-busy>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-2/3 rounded-lg" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[380px] rounded-[3px]" />
    </div>
  );
}

/** Portal del postulante · Mis postulaciones. */
export default function PortalPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
}
