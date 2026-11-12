import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { getApplicant, getMyResume, listMyApplications, listOpenJobs } from "@/features/candidates/api/portal";
import { PortalHome } from "@/features/candidates/components/portal/portal-home";

export const metadata: Metadata = { title: "Mi portal" };

async function Home() {
  const [applicant, applications, jobs, resume] = await Promise.all([getApplicant(), listMyApplications(), listOpenJobs(), getMyResume()]);
  return <PortalHome applicant={applicant} applications={applications} jobs={jobs} resume={resume} />;
}

function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-4 pt-10 sm:px-6 lg:px-8" aria-busy>
      <Skeleton className="h-[200px] rounded-3xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[260px] rounded-2xl" />
        <Skeleton className="h-[260px] rounded-2xl" />
      </div>
    </div>
  );
}

/** Portal del postulante · Inicio. */
export default function PortalPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
}
