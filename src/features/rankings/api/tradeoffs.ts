import "server-only";

import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import { toJobOpening, type ApiVacancyDetail } from "@/shared/lib/vacancy-api";
import type { RankedCandidate, RankRequirement } from "@/shared/types/ranking";
import type { TradeoffCandidate, TradeoffCell, TradeoffMatrix, TradeoffRow } from "../types/tradeoffs";
import { getRanking } from "./rankings";

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const clean = (s: string) => s.replace(/^[“"]|[”"]$/g, "").trim();

function cellOf(c: RankedCandidate, r: RankRequirement): TradeoffCell {
  const res = c.results.find((x) => x.requirementId === r.id);
  if (!res || res.result === "NO_EVIDENCE") return { status: "unknown", text: "No aparece en la hoja de vida." };
  const text = res.evidence[0] ? clean(res.evidence[0].citation) : res.justification;
  return { status: res.result === "MEETS" ? "meets" : res.result === "PARTIAL" ? "partial" : "missing", text };
}

/** Matriz armada con el ranking de cualquier vacante: requisitos del perfil y señales de la evaluación. */
function fromRanking(requirements: RankRequirement[], pool: RankedCandidate[], total: number): Pick<TradeoffMatrix, "sections" | "candidates" | "reading"> {
  const reqRows: TradeoffRow[] = requirements.slice(0, 6).map((r) => ({
    label: r.description,
    tag: r.type === "MANDATORY" ? "Obligatorio" : r.type === "NICE_TO_HAVE" ? "Deseable" : "Descalificante",
    cells: Object.fromEntries(pool.map((c) => [c.id, cellOf(c, r)])),
  }));
  const signalRows: TradeoffRow[] = [
    {
      label: "Confianza de la evaluación",
      tag: "Ponderado",
      cells: Object.fromEntries(
        pool.map((c) => {
          const pct = Math.round(c.confidence * 100);
          return [c.id, { status: pct >= 85 ? "meets" : pct >= 70 ? "partial" : "missing", text: `${pct} %: ${pct >= 85 ? "la hoja de vida es clara y fechada." : "hay puntos que confirmar en la entrevista."}` }];
        }),
      ),
    },
    {
      label: "Cómo entra en el ranking",
      tag: "Ranking",
      cells: Object.fromEntries(pool.map((c, i) => [c.id, { status: i < 3 ? "meets" : "partial", text: i === 0 ? `1.º de ${total} hojas de vida.` : `${i + 1}.º del ranking.` }])),
    },
  ];

  const candidates: TradeoffCandidate[] = pool.map((c) => {
    const met = requirements.filter((r) => cellOf(c, r).status === "meets");
    const gap = requirements.find((r) => cellOf(c, r).status !== "meets");
    return {
      id: c.id,
      name: c.name,
      initials: initials(c.name),
      score: c.score,
      pill: { label: "En ranking", tone: "blue" },
      gains: met.length ? met.slice(0, 2).map((r) => r.description).join(" y ") : "Base para crecer en el cargo",
      assumes: gap ? `Validar ${gap.description.toLowerCase()} en la entrevista.` : "Nada pendiente en el perfil.",
    };
  });

  const shown = pool.slice(0, 4);
  const hardest = requirements
    .filter((r) => r.type === "MANDATORY")
    .map((r) => ({ r, n: shown.filter((c) => cellOf(c, r).status === "meets").length }))
    .sort((a, b) => a.n - b.n)[0];
  const reading = !hardest
    ? "Compara a cada persona requisito por requisito antes de decidir."
    : hardest.n === shown.length
      ? `Todos cumplen los obligatorios: la diferencia está en los deseables y en la confianza de cada evaluación.`
      : `${hardest.n === 0 ? "Nadie" : `Solo ${hardest.n} de ${shown.length}`} cumple del todo «${hardest.r.description}»: si es innegociable, pídelo como prueba en la entrevista.`;

  return { sections: [{ title: "Requisitos del perfil de cargo", hint: "lo que pediste en la descripción de la vacante", rows: reqRows }, { title: "Señales de la evaluación", hint: "cómo leyó Criba AI cada hoja de vida", rows: signalRows }], candidates, reading };
}

/**
 * Matriz de trade-offs de una vacante, armada con su ranking real (GET /vacancies/{id}/ranking) y sus
 * datos (GET /vacancies/{id}). La lectura de Criba AI la completa la pantalla con POST …/compare.
 */
export async function getTradeoffs(jobId: string): Promise<TradeoffMatrix | null> {
  const detail = serverApi<ApiVacancyDetail>(`/vacancies/${jobId}`).catch((error: unknown) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  });
  const [ranking, found] = await Promise.all([getRanking(jobId), detail]);
  const vacancy = found ? toJobOpening(found) : null;
  if (!ranking || !vacancy) return null;
  const base = {
    job: {
      id: vacancy.id,
      title: vacancy.title,
      status: vacancy.status,
      openings: vacancy.openings,
      closesAt: vacancy.closesAt,
      received: vacancy.stats.received,
      meets: vacancy.stats.meets,
    },
    jobs: ranking.jobs.map((j) => ({ value: j.value, label: j.label })),
  };
  if (!ranking.candidates.length) return { ...base, sections: [], candidates: [], reading: "" };
  return { ...base, ...fromRanking(ranking.requirements, ranking.candidates, ranking.candidates.length) };
}
