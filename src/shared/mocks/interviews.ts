import type { Interview, InterviewTurn } from "@/shared/types/domain";

const LIVE: Interview[] = [
  {
    id: "i-1",
    evaluationId: "ev-a1",
    candidate: { id: "c-a1", name: "Daniela Osorio", contactEmail: "a1@example.com" },
    jobTitle: "Ingeniero Cloud Senior",
    status: "IN_PROGRESS",
    durationMin: 14,
    startedAt: "2026-11-10T17:40:00",
    totalQuestions: 9,
    turns: [
      { order: 1, topic: "Experiencia", question: "Cuéntame tu rol en la última migración a la nube.", answer: "Lideré la migración de 40 servicios a AKS.", verdict: "match" },
      { order: 2, topic: "Azure DevOps", question: "¿Cómo estructuraban los pipelines?", answer: "YAML multi-stage con aprobaciones por ambiente.", verdict: "match" },
      { order: 3, topic: "Azure", question: "¿Cuántos microservicios migraron a AKS y cuánto duró?", answer: "Unos 40 servicios en 8 meses. Yo lideré el pipeline en Azure DevOps.", verdict: "match" },
      { order: 4, topic: "Kubernetes", question: "¿Qué disponibilidad alcanzaron y cómo la medían?", answer: "99,9 %. Usábamos Prometheus y alertas en Grafana.", verdict: "conflict" },
      { order: 5, topic: "Inglés", question: "Can you describe your last incident in English?", answer: "Sure. Last quarter we had a DNS outage in the ingress layer…", verdict: "match" },
      { order: 6, topic: "Terraform", question: "¿Cuántos ambientes manejaban con Terraform?" },
      { order: 7, topic: "Certificaciones", question: "" },
      { order: 8, topic: "Sector", question: "" },
      { order: 9, topic: "Cierre", question: "" },
    ],
    contrasts: [
      { label: "Microservicios", cvSays: "40", interviewSays: "40", verdict: "match" },
      { label: "Disponibilidad", cvSays: "99,95 %", interviewSays: "99,9 %", verdict: "conflict" },
      { label: "Inglés", cvSays: "IELTS 7.5", interviewSays: "Fluido", verdict: "match" },
      { label: "Ambientes IaC", cvSays: "3", interviewSays: "—", verdict: "missing" },
    ],
  },
];

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

/** Todas las entrevistas de la organización: la que está en vivo y las demás. */
export const mockInterviews: Interview[] = [...LIVE, ...EXTRA];
