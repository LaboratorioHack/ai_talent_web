/** Opciones fijas de una vacante. Son listas de producto, no datos de ejemplo. */

export const AREAS = ["Tecnología", "Analítica", "Producto", "Diseño", "Seguridad", "Operaciones", "Finanzas", "Comercial", "Talento"];

export type Modality = "ONSITE" | "HYBRID" | "REMOTE";

export const MODALITY_LABEL: Record<Modality, string> = {
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
  REMOTE: "Remoto",
};

export const MODALITIES = (Object.keys(MODALITY_LABEL) as Modality[]).map((value) => ({ value, label: MODALITY_LABEL[value] }));

export const CONTRACTS = ["Término indefinido", "Término fijo, 1 año", "Término fijo, 6 meses", "Obra o labor", "Prestación de servicios", "Aprendizaje"];

export const SCHEDULES = ["Tiempo completo", "Medio tiempo", "Por horas"];

/** "HYBRID" → "Híbrido"; null o desconocido → null. */
export const modalityLabel = (value: string | null | undefined): string | null => (value && value in MODALITY_LABEL ? MODALITY_LABEL[value as Modality] : null);
