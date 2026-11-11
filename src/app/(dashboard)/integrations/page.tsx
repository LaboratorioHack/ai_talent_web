import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui";
import { getIntegrations } from "@/features/integrations/api/integrations";
import { IntegrationsView } from "@/features/integrations/components/integrations-view";

export const metadata: Metadata = { title: "Integraciones" };

async function Integrations() {
  const data = await getIntegrations();
  return <IntegrationsView data={data} />;
}

/** Pantalla 10 · Integraciones. */
export default function IntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-3 gap-4 px-12 pt-8" aria-busy>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-2xl" />
          ))}
        </div>
      }
    >
      <Integrations />
    </Suspense>
  );
}
