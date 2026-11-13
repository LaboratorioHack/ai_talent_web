/** Estado de la hoja de vida de una postulación. */
export type IngestStatus = "PROCESSING" | "READ" | "UNREADABLE" | "DUPLICATE" | "UNSUPPORTED" | "NO_DATA";

/** Canal de la postulación (applications.source). En el MVP solo llegan por la postulación del candidato. */
export type IngestSource = "upload" | "candidate";

export interface IngestFile {
  id: string;
  name: string;
  /** Extensión en mayúsculas: PDF, DOCX, JPG… */
  kind: string;
  sizeKb: number;
  pages: number;
  status: IngestStatus;
  /** Qué se leyó o por qué no: "nombre, 3 empleos y 2 certificaciones". */
  detail: string;
  source: IngestSource;
  /** Quién se postuló con este archivo. */
  person: string;
}

export interface IngestData {
  job: { id: string; title: string; requirements: number; closesAt: string; open: boolean };
  jobs: { value: string; label: string; hint?: string }[];
  files: IngestFile[];
}
