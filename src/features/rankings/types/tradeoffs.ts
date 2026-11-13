export type TradeoffStatus = "meets" | "partial" | "missing" | "unknown";

export interface TradeoffCell {
  status: TradeoffStatus;
  /** Una frase legible (la justificación de la IA). */
  text: string;
  /** La línea textual de la hoja de vida, si la hay; se ve al pedirla. */
  quote?: string;
}

export interface TradeoffRow {
  label: string;
  /** Obligatorio, Deseable, Ponderado, Ranking… */
  tag: string;
  hint?: string;
  /** Celda por id de candidato. */
  cells: Record<string, TradeoffCell>;
}

export interface TradeoffCandidate {
  id: string;
  name: string;
  initials: string;
  score: number;
  /** Confianza de la evaluación, 0–100. */
  confidence: number;
  /** Qué gana la empresa con esta persona. */
  gains: string;
  /** Qué asume (lo que hay que validar o ceder). */
  assumes: string;
}

export interface TradeoffMatrix {
  job: { id: string; title: string; status: string; openings: number; closesAt: string; received: number; meets: number };
  jobs: { value: string; label: string }[];
  sections: { title: string; hint: string; rows: TradeoffRow[] }[];
  /** Las primeras 3 se muestran; el resto se puede agregar. */
  candidates: TradeoffCandidate[];
  /** Lectura de Criba AI sobre las personas comparadas. */
  reading: string;
}
