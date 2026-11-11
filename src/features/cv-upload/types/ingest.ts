/** Estado de un archivo en la ingesta. UPLOADING solo existe en el navegador. */
export type IngestStatus = "UPLOADING" | "PROCESSING" | "READ" | "UNREADABLE" | "DUPLICATE" | "UNSUPPORTED" | "NO_DATA";

export type IngestSource = "upload" | "greenhouse" | "drive" | "linkedin";

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
  /** 0–100 mientras sube. */
  progress?: number;
}

export interface IngestData {
  job: { id: string; title: string; requirements: number };
  jobs: { value: string; label: string; hint?: string }[];
  files: IngestFile[];
}
