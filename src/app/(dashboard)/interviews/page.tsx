import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTop } from "@/shared/components/layout";
import { Skeleton } from "@/shared/components/ui";
import { listInterviews } from "@/features/interviews/api/interviews";
import { InterviewList } from "@/features/interviews/components/interview-list";

export const metadata: Metadata = { title: "Entrevistas" };

async function Interviews() {
  const interviews = await listInterviews();
  return <InterviewList interviews={interviews} />;
}

/** Lista de entrevistas con IA. */
export default function InterviewsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageTop title="Entrevistas" description="La IA pregunta por lo que falta validar y marca lo que no coincide con la hoja de vida." />
      <div className="flex flex-col px-12 pt-7 pb-14">
        <Suspense fallback={<Skeleton className="h-[420px] rounded-2xl" />}>
          <Interviews />
        </Suspense>
      </div>
    </div>
  );
}
