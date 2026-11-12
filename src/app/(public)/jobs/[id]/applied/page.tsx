import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicJob } from "@/features/candidates/api/public";
import { AppliedView } from "@/features/candidates/components/applied-view";

export const metadata: Metadata = { title: "Postulación recibida" };

async function Applied({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJob(id);
  if (!job) notFound();
  return <AppliedView job={job} />;
}

/** Pantalla 17 · Postulación recibida. */
export default function AppliedPage({ params }: PageProps<"/jobs/[id]/applied">) {
  return (
    <Suspense fallback={null}>
      <Applied params={params} />
    </Suspense>
  );
}
