/**
 * Lo que ve el candidato. Nunca lleva puntajes, pesos, equivalencias ni
 * requisitos descalificantes: eso es criterio interno de la empresa.
 */
export interface PublicJob {
  id: string;
  title: string;
  company: string;
  area: string;
  openings: number;
  closesAt: string;
  description: string;
  /** Requisitos obligatorios, en texto. */
  mandatory: string[];
  /** Requisitos deseables, en texto. */
  desirable: string[];
}

export interface CandidateInterview {
  token: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  /** Vence el enlace: ISO local. */
  expiresAt: string;
  state: "open" | "done";
  /** Preguntas base; la IA puede repreguntar si una respuesta queda corta. */
  questions: string[];
}
