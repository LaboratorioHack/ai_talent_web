/**
 * Lo que ve el candidato. Nunca lleva puntajes, pesos, porcentajes de
 * equivalencia ni requisitos descalificantes: eso es criterio interno de la empresa.
 */
export interface PublicRequirement {
  text: string;
  /** Experiencia, Idiomas, Certificaciones… agrupa la lista. */
  category: string;
  /** Equivalencias aceptadas, sin su porcentaje: "GCP", "AWS". */
  alsoCounts: string[];
}

/** Los datos de publicación son opcionales: null cuando la empresa no los escribió. */
export interface PublicJob {
  id: string;
  title: string;
  company: string;
  companySector: string | null;
  companySize: string | null;
  area: string;
  openings: number;
  /** "AAAA-MM-DD"; vacío si no tiene cierre. */
  closesAt: string;
  postedAt: string;
  location: string | null;
  /** "Presencial", "Híbrido" o "Remoto". */
  modality: string | null;
  contract: string | null;
  schedule: string | null;
  /** null: la empresa no lo publicó ("A convenir"). */
  salary: string | null;
  description: string;
  mandatory: PublicRequirement[];
  desirable: PublicRequirement[];
}

export interface CandidateInterview {
  token: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  /** Vence el enlace: ISO. */
  expiresAt: string;
  /** closed: venció o la empresa la canceló. */
  state: "open" | "done" | "closed";
  /** Preguntas base; la IA puede repreguntar si una respuesta queda corta. */
  questions: string[];
  /** Cuántas ya respondió (si vuelve al enlace, sigue donde quedó). */
  answered: number;
}
