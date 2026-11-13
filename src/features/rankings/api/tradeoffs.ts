import "server-only";

import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import { toJobOpening, type ApiVacancyDetail } from "@/shared/lib/vacancy-api";
import type { RankedCandidate, RankRequirement } from "@/shared/types/ranking";
import type { TradeoffCandidate, TradeoffCell, TradeoffMatrix, TradeoffRow } from "../types/tradeoffs";
import { sentenceCase, tidyQuote } from "@/shared/lib/text";
import { getRanking } from "./rankings";

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function cellOf(c: RankedCandidate, r: RankRequirement): TradeoffCell {
  const res = c.results.find((x) => x.requirementId === r.id);
  if (!res || res.result === "NO_EVIDENCE") return { status: "unknown", text: "No aparece en la hoja de vida." };
  // La celda dice en una frase por qué; la cita textual queda a un clic.
  const quote = res.evidence[0] ? tidyQuote(res.evidence[0].citation) : undefined;
  const text = res.justification ? sentenceCase(res.justification.trim()) : (quote ?? "");
  return { status: res.result === "MEETS" ? "meets" : res.result === "PARTIAL" ? "partial" : "missing", text, quote: quote && quote !== text ? quote : undefined };
}

/** Matriz armada con el ranking de cualquier vacante: requisitos del perfil y señales de la evaluación. */
function fromRanking(requirements: RankRequirement[], pool: RankedCandidate[]): Pick<TradeoffMatrix, "sections" | "candidates" | "reading"> {
  const reqRows: TradeoffRow[] = requirements.slice(0, 6).map((r) => ({
    label: r.description,
    tag: r.type === "MANDATORY" ? "Obligatorio" : r.type === "NICE_TO_HAVE" ? "Deseable" : "Descalificante",
    cells: Object.fromEntries(pool.map((c) => [c.id, cellOf(c, r)])),
  }));
  const candidates: TradeoffCandidate[] = pool.map((c) => {
    const met = requirements.filter((r) => cellOf(c, r).status === "meets");
    const gap = requirements.find((r) => cellOf(c, r).status !== "meets");
    return {
      id: c.id,
      name: c.name,
      initials: initials(c.name),
      score: c.score,
      confidence: Math.round(c.confidence * 100),
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

  return { sections: [{ title: "Requisitos del perfil de cargo", hint: "lo que pediste en la descripción de la vacante", rows: reqRows }], candidates, reading };
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
  return { ...base, ...fromRanking(ranking.requirements, ranking.candidates) };
}
