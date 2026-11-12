import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { getApplicant, getMyResume } from "@/features/candidates/api/portal";
import { ProfileView } from "@/features/candidates/components/portal/profile-view";

export const metadata: Metadata = { title: "Mi perfil" };

async function Profile() {
  const [applicant, resume] = await Promise.all([getApplicant(), getMyResume()]);
  return <ProfileView applicant={applicant} resume={resume} />;
}

function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-4 pt-10 sm:px-6 lg:px-8" aria-busy>
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  );
}

/** Portal del postulante · Perfil, hoja de vida y datos personales. */
export default function PortalProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Profile />
    </Suspense>
  );
}
