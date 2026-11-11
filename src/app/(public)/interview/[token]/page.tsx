import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/components/ui";
import { getCandidateInterview } from "@/features/candidates/api/public";
import { InterviewRoom } from "@/features/candidates/components/interview-room";

export const metadata: Metadata = { title: "Entrevista" };

async function Room({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const interview = await getCandidateInterview(token);
  if (!interview) notFound();
  return <InterviewRoom interview={interview} />;
}

/** Pantalla 18 · Entrevista IA, vista del candidato: chat de texto, sin voz. */
export default function CandidateInterviewPage({ params }: PageProps<"/interview/[token]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 pt-14" aria-busy>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      }
    >
      <Room params={params} />
    </Suspense>
  );
}
