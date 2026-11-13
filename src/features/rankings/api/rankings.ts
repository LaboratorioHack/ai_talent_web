import "server-only";

import { env } from "@/config/env";
import { serverApi } from "@/shared/lib/api-server";
import { delay, mockCandidatesOf, mockRequirementsOf, mockVacancies } from "@/shared/mocks";
import type { RankingData, RankingSummary, TopPerson } from "../types/ranking";

/** Ranking de una vacante con el detalle de cada evaluación. Con backend: GET /vacancies/{id}/ranking. */
export async function getRanking(jobId: string): Promise<RankingData | null> {
  if (!env.useMocks) return serverApi<RankingData>(`/vacancies/${jobId}/ranking`).catch(() => null);
  const job = mockVacancies.find((v) => v.id === jobId);
  if (!job) return delay(null);
  const requirements = mockRequirementsOf(job);
  return delay({
    job: { id: job.id, title: job.title, closesAt: job.closesAt, profileVersion: job.profile.version, received: job.stats.received },
    jobs: mockVacancies.filter((v) => v.status === "OPEN").map((v) => ({ value: v.id, label: v.title, hint: `${v.stats.meets + v.stats.partial + v.stats.doesNotMeet} evaluadas` })),
    requirements,
    candidates: job.stats.received ? mockCandidatesOf(job, requirements) : [],
  });
}

/** Resumen de todos los rankings para la portada de Ranking. Con backend: GET /rankings. */
export async function listRankings(): Promise<RankingSummary[]> {
  if (!env.useMocks) return serverApi<RankingSummary[]>("/rankings");
  return delay(
    mockVacancies
      .filter((v) => v.status === "OPEN")
      .map((v) => {
        const top = v.stats.received ? mockCandidatesOf(v, mockRequirementsOf(v)).slice(0, 3) : [];
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
  if (!env.useMocks) return serverApi<TopPerson[]>("/rankings/top");
  const people: TopPerson[] = [];
  for (const v of mockVacancies.filter((x) => x.status === "OPEN" && x.stats.received)) {
    const reqs = mockRequirementsOf(v);
    const short = (id: string) => reqs.find((r) => r.id === id)?.description ?? "";
    for (const c of mockCandidatesOf(v, reqs).slice(0, 6)) {
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
