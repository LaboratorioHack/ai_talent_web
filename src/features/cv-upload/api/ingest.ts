import "server-only";

import { redirect } from "next/navigation";
import { routes } from "@/shared/constants/routes";
import { serverApi } from "@/shared/lib/api-server";
import { toJobOpening, vacanciesPath, type ApiVacancyApplication, type ApiVacancyDetail, type ApiVacancyPage } from "@/shared/lib/vacancy-api";
import type { IngestData, IngestFile } from "../types/ingest";

const kindOf = (fileName: string | null, contentType: string | null): string => {
  const ext = fileName?.includes(".") ? fileName.split(".").pop()!.toUpperCase() : "";
  if (ext) return ext;
  if (contentType?.includes("pdf")) return "PDF";
  if (contentType?.includes("word")) return "DOCX";
  return "";
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Qué leyó Criba AI, dicho en una línea: "3 empleos y 1 certificación leídos". */
function readDetail(a: ApiVacancyApplication): string {
  const parts = [a.jobsRead ? plural(a.jobsRead, "empleo", "empleos") : null, a.certificationsRead ? plural(a.certificationsRead, "certificación", "certificaciones") : null].filter(Boolean);
  return parts.length ? `${parts.join(" y ")} leídos` : "Hoja de vida leída";
}

/** Una postulación con el estado de lectura de su hoja de vida (GET /vacancies/{id}/applications). */
function toIngestFile(a: ApiVacancyApplication): IngestFile {
  const base = {
    id: a.applicationId,
    name: a.fileName ?? a.candidateName,
    person: a.candidateName,
    kind: kindOf(a.fileName, a.contentType),
    sizeKb: a.sizeBytes ? Math.max(1, Math.round(a.sizeBytes / 1024)) : 0,
    pages: a.pages ?? 0,
    source: "candidate" as const,
  };
  if (a.processingStatus === "FAILED") return { ...base, status: "UNREADABLE", detail: a.processingError ?? "No se pudo leer la hoja de vida" };
  if (a.processingStatus !== "PROCESSED") return { ...base, status: "PROCESSING", detail: "Leyendo" };
  if (a.duplicateOf) return { ...base, status: "DUPLICATE", detail: `Mismo archivo que ${a.duplicateOf}` };
  return { ...base, status: "READ", detail: readDetail(a) };
}

/** Postulaciones de una vacante con el estado de lectura de cada hoja de vida. Sin vacantes, a crear una. */
export async function getIngest(jobId?: string): Promise<IngestData> {
  const page = await serverApi<ApiVacancyPage>(vacanciesPath);
  const active = page.items.filter((v) => v.status !== "CLOSED");
  const target = (jobId && page.items.find((v) => v.id === jobId)) || active[0];
  if (!target) redirect(routes.vacancies);

  const [job, applications] = await Promise.all([
    serverApi<ApiVacancyDetail>(`/vacancies/${target.id}`),
    serverApi<ApiVacancyApplication[]>(`/vacancies/${target.id}/applications`),
  ]);
  return {
    job: { id: job.id, title: job.title, requirements: job.requirements.length, closesAt: toJobOpening(job).closesAt, open: job.status === "OPEN" },
    jobs: active.map((v) => ({ value: v.id, label: v.title, hint: `${v.counts.resumes} hojas de vida` })),
    // Descartadas y retiradas ya no esperan nada de esta pantalla.
    files: applications.filter((a) => a.selectionStatus !== "REJECTED" && a.selectionStatus !== "WITHDRAWN").map(toIngestFile),
  };
}
