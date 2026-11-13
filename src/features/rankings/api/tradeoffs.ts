import "server-only";

import { env } from "@/config/env";
import { serverApi } from "@/shared/lib/api-server";
import { delay, mockCandidatesOf, mockRequirementsOf, mockVacancies } from "@/shared/mocks";
import type { RankedCandidate, RankRequirement } from "@/shared/types/ranking";
import type { TradeoffCandidate, TradeoffCell, TradeoffMatrix, TradeoffRow } from "../types/tradeoffs";

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

/** El caso de Analista de Datos, contado a mano como en el pen.dev. */
function dataAnalyst(): Pick<TradeoffMatrix, "sections" | "candidates" | "reading" | "secondaryAction"> {
  const ids = ["t-mn", "t-ss", "t-so", "t-ar"];
  const row = (label: string, tag: string, hint: string | undefined, cells: [TradeoffCell["status"], string][]): TradeoffRow => ({
    label,
    tag,
    hint,
    cells: Object.fromEntries(cells.map(([status, text], i) => [ids[i], { status, text }])),
  });
  return {
    candidates: [
      { id: ids[0], name: "Mariana Nieto", initials: "MN", score: 91, pill: { label: "En ranking", tone: "blue" }, gains: "Profundidad analítica y herramientas modernas", assumes: "Pedir inglés y banca en la entrevista." },
      { id: ids[1], name: "Santiago Salazar", initials: "SS", score: 87, pill: { label: "Entrevista · 22 nov", tone: "green" }, gains: "Una persona ya en entrevista y con banca", assumes: "Menos evidencia con dbt y 3 empleos en 4 años." },
      { id: ids[2], name: "Sara Ortiz", initials: "SO", score: 84, pill: { label: "En ranking", tone: "neutral" }, gains: "Conocimiento de fraude y cartera", assumes: "No hay inglés declarado: hay que probarlo." },
      { id: ids[3], name: "Alejandro Restrepo", initials: "AR", score: 80, pill: { label: "En ranking", tone: "neutral" }, gains: "Herramientas y churn medible", assumes: "Rotación y un pedido 15 % sobre el rango." },
    ],
    sections: [
      {
        title: "Requisitos del perfil de cargo",
        hint: "lo que pediste en la descripción de la vacante",
        rows: [
          row("SQL y bases de datos", "Obligatorio", undefined, [["meets", "5 años con SQL y dbt; 12 tableros de cartera."], ["meets", "SQL diario en banca; migró reportes a BigQuery."], ["meets", "SQL y Python en banco digital; modelos de riesgo."], ["partial", "SQL vía Power BI; no menciona volúmenes grandes."]]),
          row("Experiencia en el rol · 3 años o más", "Obligatorio", undefined, [["meets", "4 años como analista de datos en servicios."], ["meets", "3 años en analítica de riesgo de crédito."], ["meets", "5 años en un banco digital."], ["partial", "2 años y medio; el resto fue soporte."]]),
          row("Inglés B2", "Obligatorio", undefined, [["partial", "Dice inglés intermedio; no consta nivel."], ["meets", "B2 declarado; entrevista en inglés agendada."], ["missing", "No lo menciona en la hoja de vida."], ["meets", "Certificado B2 de 2022."]]),
          row("Sector financiero", "Deseable", undefined, [["missing", "Consultoría de software, no banca."], ["meets", "3 años en banca: riesgo de crédito."], ["meets", "Banco digital: cartera y fraude."], ["meets", "Fintech de pagos, 2 años."]]),
          row("Herramientas del cargo", "Deseable", "dbt, Power BI", [["meets", "dbt y Power BI en su último empleo."], ["partial", "Power BI sí; dbt no consta."], ["meets", "Power BI y Looker."], ["meets", "Power BI avanzado."]]),
        ],
      },
      {
        title: "Señales en la hoja de vida",
        hint: "lo que la persona subió y cómo lo cuenta",
        rows: [
          row("Evidencia con resultados medibles", "Ponderado", undefined, [["meets", "Redujo 30 % el tiempo de cierre de reportes."], ["meets", "Automatizó 8 reportes de riesgo."], ["partial", "Describe tareas, no resultados."], ["meets", "Modelo de churn con 12 % de mejora."]]),
          row("Estabilidad en el cargo", "Ponderado", undefined, [["meets", "4 años en la misma empresa."], ["partial", "3 empleos en 4 años."], ["meets", "5 años en un solo banco."], ["missing", "2 renuncias en 18 meses."]]),
          row("Cómo entra en el ranking", "Ranking", undefined, [["meets", "1.º de 37 hojas de vida."], ["meets", "2.º, ya en entrevista."], ["meets", "3.º del ranking."], ["partial", "4.º; entra por el borde del corte."]]),
        ],
      },
    ],
    reading: "Nadie combina banca, inglés B2 y dbt: si el inglés es obligatorio, descarta a Sara Ortiz o agéndale una prueba. Alejandro Restrepo además pidió 15 % por encima del rango.",
    secondaryAction: "Pedir prueba de inglés",
  };
}

/** Matriz de trade-offs de una vacante. Con backend: GET /vacancies/{id}/tradeoffs (matriz completa) o POST …/compare con 2 o 3 postulaciones. */
export async function getTradeoffs(jobId: string): Promise<TradeoffMatrix | null> {
  if (!env.useMocks) return serverApi<TradeoffMatrix>(`/vacancies/${jobId}/tradeoffs`).catch(() => null);
  const job = mockVacancies.find((v) => v.id === jobId);
  if (!job) return delay(null);
  const evaluated = job.stats.meets + job.stats.partial + job.stats.doesNotMeet;
  const base = {
    job: { id: job.id, title: job.title, status: job.status, openings: job.openings, closesAt: job.closesAt, received: job.stats.received, meets: job.stats.meets },
    jobs: mockVacancies.filter((v) => v.status === "OPEN").map((v) => ({ value: v.id, label: v.title })),
  };
  if (job.id === "v-data") return delay({ ...base, ...dataAnalyst() });
  if (!job.stats.received) return delay({ ...base, sections: [], candidates: [], reading: "" });
  const requirements = mockRequirementsOf(job);
  const pool = mockCandidatesOf(job, requirements).slice(0, 3);
  return delay({ ...base, ...fromRanking(requirements, pool, evaluated) });
}
