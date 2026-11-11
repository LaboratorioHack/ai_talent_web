import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/components/ui";
import { getInterview } from "@/features/interviews/api/interviews";
import { InterviewView } from "@/features/interviews/components/interview-view";

export const metadata: Metadata = { title: "Entrevista" };

async function Transcript({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const interview = await getInterview(id);
  if (!interview) notFound();
  return <InterviewView key={interview.id} interview={interview} />;
}

/** Pantalla 09 · Entrevista IA · Transcripción. */
export default function InterviewPage({ params }: PageProps<"/interviews/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 px-12 pt-8" aria-busy>
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-[480px] rounded-2xl" />
        </div>
      }
    >
      <Transcript params={params} />
    </Suspense>
  );
}
