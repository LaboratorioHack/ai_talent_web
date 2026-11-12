/**
 * Lo que ve el candidato. Nunca lleva puntajes, pesos, equivalencias ni
 * requisitos descalificantes: eso es criterio interno de la empresa.
 */
export interface PublicRequirement {
  text: string;
  /** Experiencia, Idiomas, Certificaciones… agrupa la lista. */
  category: string;
  /** Equivalencias aceptadas, sin su porcentaje: "GCP", "AWS". */
  alsoCounts: string[];
}

export interface PublicJob {
  id: string;
  title: string;
  company: string;
  companySector: string;
  companySize: string;
  area: string;
  openings: number;
  closesAt: string;
  postedAt: string;
  location: string;
  modality: "Presencial" | "Híbrido" | "Remoto";
  contract: string;
  schedule: string;
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
  /** Vence el enlace: ISO local. */
  expiresAt: string;
  state: "open" | "done";
  /** Preguntas base; la IA puede repreguntar si una respuesta queda corta. */
  questions: string[];
}
