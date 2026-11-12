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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-[230px] rounded-2xl" />
      ))}
    </div>
  );
}

/** Portal del postulante · Vacantes abiertas. */
export default function PortalJobsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
      <header className="flex flex-col gap-2 animate-rise">
        <p className="eyebrow">Vacantes abiertas</p>
        <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[36px]">Encuentra tu próximo cargo</h1>
        <p className="max-w-[620px] text-[15px] text-ink-2">Postúlate con la hoja de vida que ya tienes. Cada empresa la revisa con el mismo criterio que la de los demás.</p>
      </header>
      <Suspense fallback={<Loading />}>
        <Jobs />
      </Suspense>
    </div>
  );
}
