import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/components/ui";
import { getMyApplication } from "@/features/candidates/api/portal";
import { ApplicationDetail } from "@/features/candidates/components/portal/application-detail";

export const metadata: Metadata = { title: "Postulación" };

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getMyApplication(id);
  if (!application) notFound();
  return <ApplicationDetail application={application} />;
}

function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col gap-6 px-4 pt-10 sm:px-6" aria-busy>
      <Skeleton className="h-[220px] rounded-2xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  );
}

/** Portal del postulante · Detalle de una postulación. */
export default function PortalApplicationPage({ params }: PageProps<"/portal/applications/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Detail params={params} />
    </Suspense>
  );
}
