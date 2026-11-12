import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { listMyApplications } from "@/features/candidates/api/portal";
import { ApplicationCard } from "@/features/candidates/components/portal/application-card";

export const metadata: Metadata = { title: "Mis postulaciones" };

async function List() {
  const all = await listMyApplications();
  const open = all.filter((a) => a.outcome === "open");
  const closed = all.filter((a) => a.outcome !== "open");
  return (
    <>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {open.map((a, i) => (
          <ApplicationCard key={a.id} application={a} index={i} />
        ))}
      </ul>
      {closed.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Terminadas</h2>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {closed.map((a, i) => (
              <ApplicationCard key={a.id} application={a} index={i} />
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-busy>
      <Skeleton className="h-[260px] rounded-2xl" />
      <Skeleton className="h-[260px] rounded-2xl" />
    </div>
  );
}

/** Portal del postulante · Todas sus postulaciones. */
export default function PortalApplicationsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
      <header className="flex flex-col gap-2 animate-rise">
        <p className="eyebrow">Mis postulaciones</p>
        <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[36px]">Cada proceso, paso a paso</h1>
      </header>
      <Suspense fallback={<Loading />}>
        <List />
      </Suspense>
    </div>
  );
}
