import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockInterviews } from "@/shared/mocks";
import type { Interview, InterviewTurn } from "@/shared/types/domain";

const cloudTurns = (all: boolean, conflict: number | null): InterviewTurn[] => {
  const base: [string, string, string][] = [
    ["Experiencia", "Cuéntame tu rol en la última migración a la nube.", "Lideré el diseño de la plataforma y acompañé a cuatro equipos en la migración."],
    ["Azure DevOps", "¿Cómo estructuraban los pipelines?", "Pipelines en YAML por etapas, con aprobaciones manuales antes de producción."],
    ["Azure", "¿Cuántos servicios migraron a AKS y cuánto duró?", "Fueron 32 servicios en diez meses, por oleadas de cuatro."],
    ["Kubernetes", "¿Qué disponibilidad alcanzaron y cómo la medían?", "99,9 % mensual con SLO en Grafana y alertas por presupuesto de error."],
    ["Inglés", "Can you describe your last incident in English?", "We had a certificate expiry in the ingress; we automated renewals afterwards."],
    ["Terraform", "¿Cuántos ambientes manejaban con Terraform?", "Tres ambientes con módulos compartidos y estado remoto en un storage account."],
    ["Certificaciones", "¿Tienes alguna certificación de Azure en curso?", "Estoy preparando la AZ-305; presento el examen en diciembre."],
    ["Sector", "¿Has trabajado con regulación financiera?", "Sí, auditorías de la Superfinanciera sobre cambios en producción."],
    ["Cierre", "¿Qué te gustaría preguntarnos?", "Cómo se reparte la guardia y qué tanto se automatiza hoy."],
  ];
  return base.map(([topic, question, answer], i) => ({
    order: i + 1,
    topic,
    question,
    answer: all ? answer : undefined,
    verdict: all ? (i + 1 === conflict ? "conflict" : "match") : undefined,
  }));
};

const EXTRA: Interview[] = [
  {
    id: "i-2",
    evaluationId: "ev-a2",
    candidate: { id: "c-a2", name: "Julián Ríos", contactEmail: "a2@example.com" },
    jobTitle: "Ingeniero Cloud Senior",
    status: "DONE",
    durationMin: 16,
    startedAt: "2026-11-10T10:05:00",
    totalQuestions: 9,
    turns: cloudTurns(true, null),
    contrasts: [
      { label: "Servicios migrados", cvSays: "30+", interviewSays: "32", verdict: "match" },
      { label: "Disponibilidad", cvSays: "99,9 %", interviewSays: "99,9 %", verdict: "match" },
      { label: "Inglés", cvSays: "B2", interviewSays: "Fluido", verdict: "match" },
      { label: "Ambientes IaC", cvSays: "3", interviewSays: "3", verdict: "match" },
    ],
    recommendation: "ADVANCE",
  },
  {
    id: "i-3",
    evaluationId: "ev-a5",
    candidate: { id: "c-a5", name: "Andrés Pardo", contactEmail: "a5@example.com" },
    jobTitle: "Ingeniero Cloud Senior",
    status: "DONE",
    durationMin: 13,
    startedAt: "2026-11-09T15:20:00",
    totalQuestions: 9,
    turns: cloudTurns(true, 3),
    contrasts: [
      { label: "Servicios migrados", cvSays: "45", interviewSays: "32", verdict: "conflict" },
      { label: "Disponibilidad", cvSays: "99,9 %", interviewSays: "99,9 %", verdict: "match" },
      { label: "Inglés", cvSays: "C1", interviewSays: "B2", verdict: "conflict" },
      { label: "Ambientes IaC", cvSays: "—", interviewSays: "3", verdict: "missing" },
    ],
    recommendation: "REVIEW",
  },
  {
    id: "i-4",
    evaluationId: "ev-a3",
    candidate: { id: "c-a3", name: "Sebastián Vega", contactEmail: "a3@example.com" },
    jobTitle: "Ingeniero Cloud Senior",
    status: "SCHEDULED",
    durationMin: 0,
    startedAt: "2026-11-13T23:59:00",
    totalQuestions: 9,
    turns: cloudTurns(false, null),
    contrasts: [],
  },
  {
    id: "i-5",
    evaluationId: "ev-d1",
    candidate: { id: "c-d1", name: "Valentina Cruz", contactEmail: "d1@example.com" },
    jobTitle: "Analista de Datos",
    status: "DONE",
    durationMin: 15,
    startedAt: "2026-11-08T11:30:00",
    totalQuestions: 8,
    turns: cloudTurns(true, 2).slice(0, 8),
    contrasts: [
      { label: "Años con SQL", cvSays: "5", interviewSays: "5", verdict: "match" },
      { label: "Herramienta BI", cvSays: "Power BI", interviewSays: "Looker", verdict: "conflict" },
    ],
    recommendation: "DO_NOT_ADVANCE",
  },
];

const all = () => [...mockInterviews, ...EXTRA];

/** Entrevistas de la organización. Con backend: GET /interviews. */
export async function listInterviews(): Promise<Interview[]> {
  if (!env.useMocks) return apiFetch<Interview[]>("/interviews");
  return delay(all());
}

/** Una entrevista con su transcripción y el contraste con la hoja de vida. Con backend: GET /interviews/{id}. */
export async function getInterview(id: string): Promise<Interview | null> {
  if (!env.useMocks) return apiFetch<Interview>(`/interviews/${id}`).catch(() => null);
  return delay(all().find((i) => i.id === id) ?? null);
}
