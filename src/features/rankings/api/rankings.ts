import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockApplications, mockResumeDocs, mockVacancies } from "@/shared/mocks";
import type { Fulfillment, JobOpening, RequirementResult } from "@/shared/types/domain";
import type { ResumeDoc, ResumeLine } from "@/shared/types/resume-doc";
import type { RankedCandidate, RankingData, RankingSummary, RankRequirement, TopPerson } from "../types/ranking";

/* ------------------------------------------------------------------ */
/* Mock: candidatos coherentes con las cifras de cada vacante.         */
/* ------------------------------------------------------------------ */

const FIRST = ["Daniela", "Julián", "Sebastián", "Mariana", "Andrés", "Camila", "Laura", "Ricardo", "Felipe", "Paula", "Santiago", "Valentina", "Tomás", "Isabela", "Mateo", "Lucía", "Nicolás", "Sara", "Juan Pablo", "Manuela", "David", "Gabriela", "Esteban", "Natalia", "Alejandro", "Carolina", "Diego", "Juliana"];
const LAST = ["Osorio", "Ríos", "Vega", "López", "Pardo", "Torres", "Quintero", "Méndez", "Arias", "Nieto", "Rojas", "Cruz", "Herrera", "Duarte", "Salazar", "Cárdenas", "Bernal", "Montoya", "Gil", "Ortiz", "Cifuentes", "Zapata", "Mora", "Franco", "Restrepo", "Galeano"];
const COMPANIES = ["un banco digital", "una fintech de pagos", "una aseguradora", "una empresa de retail", "una consultora de software", "una empresa de telecomunicaciones"];

const GENERIC: RankRequirement[] = [
  { id: "g-exp", description: "Experiencia en el rol, 3 años o más", type: "MANDATORY", weight: 30, category: "Experiencia", equivalences: [] },
  { id: "g-tools", description: "Herramientas clave del cargo", type: "MANDATORY", weight: 25, category: "Técnico", equivalences: [{ label: "Herramienta equivalente", percent: 80 }] },
  { id: "g-edu", description: "Profesional en carrera afín", type: "MANDATORY", weight: 15, category: "Educación", equivalences: [{ label: "Tecnólogo con experiencia", percent: 70 }] },
  { id: "g-en", description: "Inglés B1 o más", type: "MANDATORY", weight: 10, category: "Idiomas", equivalences: [] },
  { id: "g-sector", description: "Experiencia en servicios financieros", type: "NICE_TO_HAVE", weight: 10, category: "Sector", equivalences: [{ label: "Seguros", percent: 80 }] },
  { id: "g-cert", description: "Certificación del área", type: "NICE_TO_HAVE", weight: 10, category: "Certificaciones", equivalences: [] },
];

const CITATION: Record<string, (i: number) => [string, string]> = {
  "r-azure": (i) => [`Despliegues en Azure con AKS y pipelines en Azure DevOps para ${10 + (i % 30)} servicios.`, "2021–2025"],
  "r-k8s": (i) => [`Operación de clústeres Kubernetes en producción con ${3 + (i % 6)} equipos.`, "2020–2025"],
  "r-iac": () => ["Infraestructura como código con Terraform en ambientes de prueba y producción.", "2022–2025"],
  "r-en": (i) => [i % 2 ? "Inglés C1, reuniones diarias con equipo en EE. UU." : "Inglés B2 certificado (TOEFL 92).", "2023"],
  "r-cert": () => ["AWS Certified Solutions Architect – Associate", "2024"],
  "r-fin": (i) => [`Ingeniería de plataforma en ${COMPANIES[i % 3]}.`, "2022–2025"],
  "g-exp": (i) => [`${3 + (i % 5)} años en el cargo en ${COMPANIES[i % COMPANIES.length]}.`, "2020–2025"],
  "g-tools": () => ["Uso diario de las herramientas del cargo con resultados medibles.", "2021–2025"],
  "g-edu": () => ["Profesional en carrera afín, universidad acreditada.", "2019"],
  "g-en": (i) => [i % 2 ? "Inglés B2, presentaciones a clientes." : "Inglés B1 con curso en curso.", "2023"],
  "g-sector": (i) => [`Proyectos para ${COMPANIES[i % 3]}.`, "2022–2024"],
  "g-cert": () => ["Certificación profesional del área vigente.", "2024"],
};

function requirementsOf(job: JobOpening): RankRequirement[] {
  const reqs = job.profile.requirements.length ? job.profile.requirements : GENERIC;
  return reqs.map((r) => ({ id: r.id, description: r.description, type: r.type, weight: r.weight, category: r.category, equivalences: r.equivalences }));
}

/** Reparte el puntaje total entre los requisitos, respetando cuántos obligatorios cumple. */
function synthResults(reqs: RankRequirement[], score: number, mandatoryMet: number, seed: number): RequirementResult[] {
  const scored = reqs.filter((r) => r.type !== "DISQUALIFYING");
  const mandatory = scored.filter((r) => r.type === "MANDATORY");
  const rotate = seed % mandatory.length;
  const order = [...mandatory.slice(rotate), ...mandatory.slice(0, rotate)];
  const met = new Set(order.slice(0, mandatoryMet).map((r) => r.id));
  const partialId = order[mandatoryMet]?.id;
  let left = score;
  const pts = new Map<string, number>();
  for (const r of mandatory) {
    const w = r.weight ?? 0;
    const p = met.has(r.id) ? w : r.id === partialId ? Math.round(w / 2) : 0;
    pts.set(r.id, Math.min(p, Math.max(left, 0)));
    left -= pts.get(r.id) ?? 0;
  }
  for (const r of scored.filter((x) => x.type === "NICE_TO_HAVE")) {
    const p = Math.max(0, Math.min(r.weight ?? 0, left));
    pts.set(r.id, p);
    left -= p;
  }
  return reqs.map((r, i) => {
    if (r.type === "DISQUALIFYING") return { id: `rr-${seed}-${i}`, requirementId: r.id, result: "NO_EVIDENCE", score: 0, confidence: 0.96, justification: "Sin indicios en la hoja de vida.", evidence: [] };
    const w = r.weight ?? 0;
    const p = pts.get(r.id) ?? 0;
    const result = p >= w ? "MEETS" : p > 0 ? "PARTIAL" : "DOES_NOT_MEET";
    const [citation, years] = (CITATION[r.id] ?? CITATION["g-tools"])(seed + i);
    const page = i < 3 ? 1 : 2;
    return {
      id: `rr-${seed}-${i}`,
      requirementId: r.id,
      result,
      score: p,
      confidence: 0.78 + ((seed + i) % 18) / 100,
      justification:
        result === "MEETS" ? "La hoja de vida lo prueba con un dato concreto." : result === "PARTIAL" ? `Cuenta a medias por equivalencia o tiempo: ${p} de ${w} puntos.` : "No se encontró evidencia en la hoja de vida.",
      evidence: result === "DOES_NOT_MEET" ? [] : [{ id: `ev-${seed}-${i}`, citation, location: `CV pág. ${page}, ${years}` }],
    };
  });
}

/** Arma la hoja de vida "en papel" a partir de lo leído, con la nota de cada requisito. */
function synthResume(name: string, title: string, reqs: RankRequirement[], results: RequirementResult[], seed: number): ResumeDoc {
  const lineOf = (r: RequirementResult): ResumeLine | null => {
    const req = reqs.find((x) => x.id === r.requirementId);
    const ev = r.evidence[0];
    if (!req || !ev) return null;
    return { kind: "bullet", text: ev.citation, note: { requirement: req.description, points: r.score, partial: r.result === "PARTIAL" } };
  };
  const byCat = (cats: string[]) => results.filter((r) => cats.includes(reqs.find((x) => x.id === r.requirementId)?.category ?? "")).map(lineOf).filter(Boolean) as ResumeLine[];
  const work = results.filter((r) => !["Idiomas", "Certificaciones", "Educación"].includes(reqs.find((x) => x.id === r.requirementId)?.category ?? "")).map(lineOf).filter(Boolean) as ResumeLine[];
  const lang = byCat(["Idiomas"]).map((l) => ({ ...l, kind: "text" as const }));
  const cert = byCat(["Certificaciones"]).map((l) => ({ ...l, kind: "text" as const }));
  const edu = byCat(["Educación"]).map((l) => ({ ...l, kind: "text" as const }));
  return {
    name,
    headline: title,
    contact: [`${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@correo.com`, "+57 300 000 0000", ["Medellín", "Bogotá", "Cali", "Barranquilla"][seed % 4] + ", Colombia"],
    pages: 2,
    sections: [
      { title: "Perfil", lines: [{ kind: "text", text: `${title} con ${3 + (seed % 6)} años de experiencia. Me interesa construir con calidad y dejar procesos documentados.` }] },
      {
        title: "Experiencia",
        lines: [{ kind: "role", text: `${title} — ${COMPANIES[seed % COMPANIES.length]}`, right: "2022 – 2025" }, ...work.slice(0, 4), { kind: "role", text: `Cargo anterior — ${COMPANIES[(seed + 2) % COMPANIES.length]}`, right: "2019 – 2022" }, { kind: "bullet", text: "Mejoras de procesos y acompañamiento a personas nuevas del equipo." }],
      },
      { title: "Educación", lines: edu.length ? edu : [{ kind: "role", text: "Profesional — Universidad pública", right: "2018" }] },
      ...(cert.length ? [{ title: "Certificaciones", lines: cert }] : []),
      { title: "Idiomas", lines: lang.length ? lang : [{ kind: "text", text: "Español nativo" }] },
    ],
  };
}

function scoreFor(bucket: Fulfillment, i: number, n: number) {
  const t = n > 1 ? i / (n - 1) : 0;
  if (bucket === "MEETS") return Math.round(91 - t * 11);
  if (bucket === "PARTIAL") return Math.round(79 - t * 24);
  return Math.round(49 - t * 34);
}

function candidatesOf(job: JobOpening, reqs: RankRequirement[]): RankedCandidate[] {
  const mandatoryTotal = reqs.filter((r) => r.type === "MANDATORY").length;
  const out: RankedCandidate[] = [];
  const used = new Set<string>();

  if (job.id === "v-cloud") {
    for (const a of mockApplications) {
      const ev = a.evaluation;
      if (!ev) continue;
      const seed = out.length;
      const mandatoryMet = ev.fulfillment === "MEETS" ? mandatoryTotal : ev.fulfillment === "PARTIAL" ? mandatoryTotal - 1 : 1;
      const results = ev.results.length ? ev.results : synthResults(reqs, ev.totalScore, mandatoryMet, seed);
      used.add(a.candidate.name);
      out.push({
        id: a.id,
        name: a.candidate.name,
        score: ev.totalScore,
        fulfillment: ev.fulfillment,
        mandatoryMet,
        mandatoryTotal,
        confidence: ev.confidence,
        evaluatedAt: ev.evaluatedAt,
        sourceLabel: "Hoja de vida subida",
        results,
        toValidate: ev.toValidate.length ? ev.toValidate : results.filter((r) => r.result === "PARTIAL").map((r) => ({ label: `${reqs.find((x) => x.id === r.requirementId)?.description} parcial`, tone: "warning" as const })),
        resume: mockResumeDocs[a.id] ?? synthResume(a.candidate.name, job.title, reqs, results, seed),
      });
    }
  }

  const buckets: [Fulfillment, number][] = [
    ["MEETS", job.stats.meets],
    ["PARTIAL", job.stats.partial],
    ["DOES_NOT_MEET", job.stats.doesNotMeet],
  ];
  let k = [...job.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 97;
  for (const [bucket, total] of buckets) {
    const have = out.filter((c) => c.fulfillment === bucket).length;
    const need = Math.max(0, total - have);
    for (let i = 0; i < need; i++) {
      let name = "";
      do {
        name = `${FIRST[(k * 7 + 3) % FIRST.length]} ${LAST[(k * 5 + 11) % LAST.length]}`;
        k++;
      } while (used.has(name) && k < 2000);
      used.add(name);
      const seed = 100 + out.length;
      const score = scoreFor(bucket, i + have, total);
      const mandatoryMet = bucket === "MEETS" ? mandatoryTotal : bucket === "PARTIAL" ? mandatoryTotal - 1 : Math.max(0, mandatoryTotal - 2 - (i % 2));
      const results = synthResults(reqs, score, mandatoryMet, seed);
      out.push({
        id: `${job.id}-c${out.length}`,
        name,
        score,
        fulfillment: bucket,
        mandatoryMet,
        mandatoryTotal,
        confidence: 0.76 + (seed % 20) / 100,
        evaluatedAt: "2026-11-11T09:42:00",
        sourceLabel: seed % 4 === 0 ? "Llegó por Greenhouse" : "Hoja de vida subida",
        results,
        toValidate: results.filter((r) => r.result === "PARTIAL").slice(0, 2).map((r) => ({ label: `${reqs.find((x) => x.id === r.requirementId)?.description} parcial`, tone: "warning" as const })),
        resume: synthResume(name, job.title, reqs, results, seed),
      });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------ */

/** Ranking de una vacante con el detalle de cada evaluación. Con backend: GET /vacancies/{id}/ranking. */
export async function getRanking(jobId: string): Promise<RankingData | null> {
  if (!env.useMocks) return apiFetch<RankingData>(`/vacancies/${jobId}/ranking`).catch(() => null);
  const job = mockVacancies.find((v) => v.id === jobId);
  if (!job) return delay(null);
  const requirements = requirementsOf(job);
  return delay({
    job: { id: job.id, title: job.title, closesAt: job.closesAt, profileVersion: job.profile.version, received: job.stats.received },
    jobs: mockVacancies.filter((v) => v.status === "OPEN").map((v) => ({ value: v.id, label: v.title, hint: `${v.stats.meets + v.stats.partial + v.stats.doesNotMeet} evaluadas` })),
    requirements,
    candidates: job.stats.received ? candidatesOf(job, requirements) : [],
  });
}

/** Resumen de todos los rankings para la portada de Ranking. Con backend: GET /rankings. */
export async function listRankings(): Promise<RankingSummary[]> {
  if (!env.useMocks) return apiFetch<RankingSummary[]>("/rankings");
  return delay(
    mockVacancies
      .filter((v) => v.status === "OPEN")
      .map((v) => {
        const top = v.stats.received ? candidatesOf(v, requirementsOf(v)).slice(0, 3) : [];
        return {
          id: v.id,
          title: v.title,
          closesAt: v.closesAt,
          evaluated: v.stats.meets + v.stats.partial + v.stats.doesNotMeet,
          meets: v.stats.meets,
          partial: v.stats.partial,
          doesNotMeet: v.stats.doesNotMeet,
          top: top.map((c) => ({ id: c.id, name: c.name, score: c.score })),
        };
      }),
  );
}

/** Las personas con mejor ajuste en todas las vacantes abiertas. Con backend: GET /rankings/top. */
export async function listTopPeople(): Promise<TopPerson[]> {
  if (!env.useMocks) return apiFetch<TopPerson[]>("/rankings/top");
  const people: TopPerson[] = [];
  for (const v of mockVacancies.filter((x) => x.status === "OPEN" && x.stats.received)) {
    const reqs = requirementsOf(v);
    const short = (id: string) => reqs.find((r) => r.id === id)?.description ?? "";
    for (const c of candidatesOf(v, reqs).slice(0, 6)) {
      const strong = [...c.results].filter((r) => r.evidence.length && r.result === "MEETS").sort((a, b) => b.score - a.score);
      people.push({
        id: c.id,
        name: c.name,
        score: c.score,
        fulfillment: c.fulfillment,
        confidence: c.confidence,
        jobId: v.id,
        jobTitle: v.title,
        highlights: strong.slice(0, 2).map((r) => ({ requirement: short(r.requirementId), citation: r.evidence[0].citation })),
        met: c.results.filter((r) => r.result === "MEETS").map((r) => short(r.requirementId)),
        missing: c.results.filter((r) => r.result === "PARTIAL" || r.result === "DOES_NOT_MEET").map((r) => short(r.requirementId)),
      });
    }
  }
  return delay(people.sort((a, b) => b.score - a.score));
}
