import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockVacancies } from "@/shared/mocks";
import type { IngestData, IngestFile } from "../types/ingest";

const NAMES = [
  "Daniela Osorio", "Julián Ríos", "Sebastián Vega", "Mariana López", "Andrés Pardo", "Camila Torres", "Laura Quintero", "Ricardo Méndez",
  "Felipe Arias", "Paula Nieto", "Santiago Rojas", "Valentina Cruz", "Tomás Herrera", "Isabela Duarte", "Mateo Salazar", "Lucía Cárdenas",
  "Nicolás Bernal", "Sara Montoya", "Juan Pablo Gil", "Manuela Ortiz", "David Cifuentes", "Gabriela Zapata", "Esteban Mora", "Natalia Franco",
];

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");

/**
 * Las leídas y los casos que necesitan acción (ilegibles, duplicadas,
 * rechazadas y una leyéndose). Recibidas = leídas + pendientes, igual que en
 * la lista de vacantes, el tablero y el panel.
 */
function mockFiles(total: number, pending: number): IngestFile[] {
  const attention: IngestFile[] = [
    { id: "f-u1", name: "cv_scan_0231.pdf", kind: "PDF", sizeKb: 2310, pages: 1, status: "UNREADABLE", detail: "Escaneo borroso, sin texto que leer", source: "upload" },
    { id: "f-u2", name: "cv_scan_0244.pdf", kind: "PDF", sizeKb: 1980, pages: 2, status: "UNREADABLE", detail: "Escaneo inclinado y cortado en el borde", source: "upload" },
    { id: "f-u3", name: "IMG_20261102_0912.heic", kind: "HEIC", sizeKb: 3400, pages: 1, status: "UNREADABLE", detail: "Foto con reflejo sobre el texto", source: "candidate" },
    { id: "f-p1", name: "hv_ingeniero_cloud.docx", kind: "DOCX", sizeKb: 92, pages: 3, status: "PROCESSING", detail: "Leyendo", source: "candidate" },
    { id: "f-d1", name: "daniela_osorio_cv (1).pdf", kind: "PDF", sizeKb: 184, pages: 2, status: "DUPLICATE", detail: "Igual a daniela_osorio_cv.pdf", source: "upload" },
    { id: "f-d2", name: "julian_rios_v2.pdf", kind: "PDF", sizeKb: 170, pages: 2, status: "DUPLICATE", detail: "Mismo contenido que julian_rios.pdf", source: "candidate" },
    { id: "f-n1", name: "carta_presentacion.pdf", kind: "PDF", sizeKb: 40, pages: 1, status: "NO_DATA", detail: "No parece una hoja de vida", source: "upload" },
    { id: "f-x1", name: "portafolio.zip", kind: "ZIP", sizeKb: 9800, pages: 0, status: "UNSUPPORTED", detail: "Comprimido: descomprímelo y sube los archivos", source: "upload" },
  ];
  const kinds = ["PDF", "PDF", "DOCX", "PDF", "JPG", "PDF", "DOCX", "PNG"];
  const read: IngestFile[] = Array.from({ length: total }, (_, i) => {
    const name = NAMES[i % NAMES.length];
    const kind = kinds[i % kinds.length];
    const n = Math.floor(i / NAMES.length);
    const image = kind === "JPG" || kind === "PNG";
    return {
      id: `f-r${i}`,
      name: `${slug(name)}${n ? `_${n + 1}` : ""}.${kind.toLowerCase()}`,
      kind,
      sizeKb: image ? 1400 + ((i * 137) % 900) : 80 + ((i * 53) % 220),
      pages: image ? 1 : 1 + (i % 3),
      status: "READ",
      detail: image ? `Foto leída con reconocimiento de texto, ${2 + (i % 3)} empleos` : `${2 + (i % 4)} empleos y ${1 + (i % 3)} certificaciones leídos`,
      source: i % 4 === 0 ? "candidate" : "upload",
    };
  });
  return [...attention.slice(0, pending), ...read];
}

/** Archivos de una vacante con su estado de lectura. Con backend: GET /vacancies/{id}/resumes. */
export async function getIngest(jobId?: string): Promise<IngestData> {
  const job = mockVacancies.find((v) => v.id === jobId) ?? mockVacancies[0];
  if (!env.useMocks) return apiFetch<IngestData>(`/vacancies/${job.id}/resumes`);

  return delay({
    job: { id: job.id, title: job.title, requirements: job.profile.requirements.length || 6, closesAt: job.closesAt, open: job.status === "OPEN" },
    jobs: mockVacancies.filter((v) => v.status !== "CLOSED").map((v) => ({ value: v.id, label: v.title, hint: `${v.stats.received} hojas de vida` })),
    files: job.stats.received ? mockFiles(job.stats.read, job.stats.received - job.stats.read) : [],
  });
}
