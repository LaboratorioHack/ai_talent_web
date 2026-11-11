import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTop } from "@/shared/components/layout";
import { Skeleton } from "@/shared/components/ui";
import { listInterviews } from "@/features/interviews/api/interviews";
import { InterviewInbox } from "@/features/interviews/components/interview-inbox";

export const metadata: Metadata = { title: "Entrevistas" };

async function Interviews() {
  const interviews = await listInterviews();
  return <InterviewInbox interviews={interviews} />;
}

/** Entrevistas con IA como bandeja de conversaciones. */
export default function InterviewsPage() {
  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-var(--app-header,0px))] lg:flex-none">
      <PageTop sticky={false} title="Entrevistas" description="La IA pregunta por lo que falta validar y marca lo que no coincide con la hoja de vida." />
      <Suspense
        fallback={
          <div className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]" aria-busy>
            <div className="flex flex-col gap-3 border-r border-border p-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-[76px] rounded-2xl" />
              ))}
            </div>
            <div className="bg-surface p-12">
              <Skeleton className="h-[420px] rounded-2xl" />
            </div>
          </div>
        }
      >
        <Interviews />
      </Suspense>
    </div>
  );
}
