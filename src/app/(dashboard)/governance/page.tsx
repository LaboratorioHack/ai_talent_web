import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { getGovernance } from "@/features/governance/api/governance";
import { GovernanceView } from "@/features/governance/components/governance-view";

export const metadata: Metadata = { title: "Gobierno IA" };

async function Governance() {
  const data = await getGovernance();
  return <GovernanceView data={data} />;
}

/** Pantalla 11 · Gobierno de IA · Auditoría. */
export default function GovernancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 px-12 pt-8" aria-busy>
          <Skeleton className="h-[100px] rounded-2xl" />
          <Skeleton className="h-[480px] rounded-2xl" />
        </div>
      }
    >
      <Governance />
    </Suspense>
  );
}
