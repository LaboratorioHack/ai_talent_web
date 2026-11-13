import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink, EmptyState, Skeleton } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { getMyResume, listMyApplications } from "@/features/candidates/api/portal";
import { ResumeView } from "@/features/candidates/components/portal/resume-view";

export const metadata: Metadata = { title: "Mi hoja de vida" };

async function Resume() {
  const [resume, applications] = await Promise.all([getMyResume(), listMyApplications()]);
  if (!resume) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-14 sm:px-6 lg:px-8">
        <EmptyState
          title="Todavía no tienes hoja de vida"
          description="Se guarda cuando te postulas a una vacante. Después puedes verla, editarla y subir otra versión."
          action={<ButtonLink href={routes.portalJobs}>Ver vacantes</ButtonLink>}
        />
      </div>
    );
  }
  return <ResumeView resume={resume} applications={applications} />;
}

function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 pt-14 sm:px-6 lg:px-8" aria-busy>
      <Skeleton className="h-12 w-80 rounded-lg" />
      <Skeleton className="mx-auto h-[720px] w-full max-w-[820px] rounded-[3px]" />
    </div>
  );
}

/** Portal del postulante · Mi hoja de vida: vista previa y edición. */
export default function PortalResumePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Resume />
    </Suspense>
  );
}
