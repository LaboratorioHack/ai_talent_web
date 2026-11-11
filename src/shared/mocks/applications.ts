import type { Application, Evaluation, Fulfillment, PipelineStage, RequirementResult, Resume } from "@/shared/types/domain";

type Row = {
  id: string;
  name: string;
  score: number;
  fulfillment: Fulfillment;
  stage: PipelineStage;
  mandatoryMet: number;
};

const rows: Row[] = [
  { id: "a1", name: "Daniela Osorio", score: 92, fulfillment: "MEETS", stage: "interview", mandatoryMet: 4 },
  { id: "a2", name: "Julián Ríos", score: 88, fulfillment: "MEETS", stage: "finalist", mandatoryMet: 4 },
  { id: "a3", name: "Sebastián Vega", score: 85, fulfillment: "MEETS", stage: "meets", mandatoryMet: 4 },
  { id: "a4", name: "Mariana López", score: 78, fulfillment: "PARTIAL", stage: "evaluated", mandatoryMet: 3 },
  { id: "a5", name: "Andrés Pardo", score: 76, fulfillment: "PARTIAL", stage: "interview", mandatoryMet: 3 },
  { id: "a6", name: "Camila Torres", score: 71, fulfillment: "PARTIAL", stage: "evaluated", mandatoryMet: 3 },
  { id: "a7", name: "Laura Quintero", score: 64, fulfillment: "PARTIAL", stage: "received", mandatoryMet: 3 },
  { id: "a8", name: "Ricardo Méndez", score: 41, fulfillment: "DOES_NOT_MEET", stage: "received", mandatoryMet: 1 },
  { id: "a9", name: "Felipe Arias", score: 38, fulfillment: "DOES_NOT_MEET", stage: "evaluated", mandatoryMet: 1 },
  { id: "a10", name: "Paula Nieto", score: 0, fulfillment: "DOES_NOT_MEET", stage: "received", mandatoryMet: 0 },
];

const danielaResults: RequirementResult[] = [
  {
    id: "rr1",
    requirementId: "r-azure",
    result: "MEETS",
    score: 25,
    confidence: 0.95,
    justification: "Experiencia directa en AKS y Azure DevOps.",
    evidence: [{ id: "e1", citation: "Migración de 40 microservicios a AKS; pipelines en Azure DevOps.", location: "CV pág. 1 · 2022–2025" }],
  },
  {
    id: "rr2",
    requirementId: "r-k8s",
    result: "MEETS",
    score: 20,
    confidence: 0.93,
    justification: "Opera clústeres en producción y tiene CKA.",
    evidence: [{ id: "e2", citation: "Operación de clústeres AKS y GKE, 99,95 % de disponibilidad. + CKA", location: "CV pág. 1 · cert. 2023" }],
  },
  {
    id: "rr3",
    requirementId: "r-iac",
    result: "MEETS",
    score: 15,
    confidence: 0.9,
    justification: "Terraform y Bicep en tres ambientes.",
    evidence: [{ id: "e3", citation: "Infraestructura como código con Terraform y Bicep, 3 ambientes.", location: "CV pág. 2 · 2022–2025" }],
  },
  {
    id: "rr4",
    requirementId: "r-en",
    result: "MEETS",
    score: 10,
    confidence: 0.88,
    justification: "IELTS 7.5 y equipo distribuido.",
    evidence: [{ id: "e4", citation: "IELTS 7.5 · equipo distribuido con EE. UU.", location: "CV pág. 2 · 2023" }],
  },
  {
    id: "rr5",
    requirementId: "r-cert",
    result: "PARTIAL",
    score: 9,
    confidence: 0.8,
    justification: "Tiene AWS SA Professional. Equivalencia parcial definida al 60 %.",
    evidence: [{ id: "e5", citation: "AWS Certified Solutions Architect – Professional", location: "CV pág. 2 · 2024" }],
  },
  {
    id: "rr6",
    requirementId: "r-fin",
    result: "MEETS",
    score: 13,
    confidence: 0.9,
    justification: "Bancolombia Digital cuenta como banca según tus equivalencias.",
    evidence: [{ id: "e6", citation: "Ingeniera de plataforma · Bancolombia Digital", location: "CV pág. 1 · 2022–2025" }],
  },
  { id: "rr7", requirementId: "r-comp", result: "NO_EVIDENCE", score: 0, confidence: 0.97, justification: "Sin indicios de empleador competidor.", evidence: [] },
];

function evaluationFor(row: Row): Evaluation {
  const results = row.id === "a1" ? danielaResults : [];
  return {
    id: `ev-${row.id}`,
    applicationId: row.id,
    candidateId: `c-${row.id}`,
    jobOpeningId: "v-cloud",
    status: "DONE",
    totalScore: row.score,
    fulfillment: row.fulfillment,
    disqualified: false,
    confidence: row.id === "a1" ? 0.91 : 0.8,
    strengths: [],
    gaps: [],
    recommendInterview: row.fulfillment === "MEETS",
    toValidate:
      row.id === "a1"
        ? [
            { label: "Cert. Azure · parcial", tone: "warning" },
            { label: "Disponibilidad 99,95 %", tone: "neutral" },
          ]
        : [],
    results,
    evaluatedAt: "2026-11-11T09:42:00",
    profileVersion: 3,
  };
}

function resumeFor(row: Row): Resume {
  const slug = row.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");
  return {
    id: `res-${row.id}`,
    candidateId: `c-${row.id}`,
    fileName: `${slug}_cv.pdf`,
    fileType: "PDF",
    pages: 2,
    sizeKb: 184,
    status: row.score > 0 ? "READ" : "PENDING",
    summary: row.score > 0 ? "nombre, 3 empleos y 4 certificaciones leídos" : undefined,
  };
}

export const mockApplications: Application[] = rows.map((row) => ({
  id: row.id,
  jobOpeningId: "v-cloud",
  candidate: { id: `c-${row.id}`, name: row.name, contactEmail: `${row.id}@example.com` },
  source: "COMPANY_UPLOAD",
  stage: row.stage,
  selectionStatus: row.stage === "finalist" ? "FINALIST" : row.stage === "interview" ? "INTERVIEW" : "EVALUATED",
  evaluation: row.score > 0 ? evaluationFor(row) : undefined,
  resume: resumeFor(row),
}));

/** Archivos de la pantalla 07 (ingesta), con todos los estados posibles. */
export const mockResumeFiles: Resume[] = [
  { id: "f1", candidateId: "c-a1", fileName: "daniela_osorio_cv.pdf", fileType: "PDF", pages: 2, sizeKb: 184, status: "READ", summary: "nombre, 3 empleos y 4 certificaciones leídos" },
  { id: "f2", candidateId: "c-x2", fileName: "cv_ingeniero_2026.docx", fileType: "DOCX", pages: 3, sizeKb: 92, status: "PROCESSING", summary: "leyendo…" },
  { id: "f3", candidateId: "c-x3", fileName: "scan_hoja_de_vida.jpg", fileType: "JPG", pages: 1, sizeKb: 2140, status: "UNREADABLE", summary: "imagen borrosa · pedir original" },
  { id: "f4", candidateId: "c-a2", fileName: "julian_rios_v2.pdf", fileType: "PDF", pages: 2, sizeKb: 170, status: "DUPLICATE", summary: "mismo contenido que julian_rios.pdf" },
  { id: "f5", candidateId: "c-x5", fileName: "portafolio.zip", fileType: "PDF", pages: 0, sizeKb: 9800, status: "UNSUPPORTED", summary: "formato no soportado" },
  { id: "f6", candidateId: "c-x6", fileName: "carta_presentacion.pdf", fileType: "PDF", pages: 1, sizeKb: 40, status: "NO_DATA", summary: "no parece una hoja de vida" },
  { id: "f7", candidateId: "c-a3", fileName: "sebastian_vega.pdf", fileType: "PDF", pages: 2, sizeKb: 201, status: "READ", summary: "nombre, 4 empleos y 2 certificaciones leídos" },
];
