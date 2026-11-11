import type { Interview } from "@/shared/types/domain";

export const mockInterviews: Interview[] = [
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
