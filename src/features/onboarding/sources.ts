/** Fuentes de hojas de vida que se pueden conectar en el onboarding y en Integraciones. */
export type ConnectMethod = "none" | "api-key" | "oauth";

export interface SourceDef {
  id: string;
  name: string;
  detail: string;
  /** Logo oficial en public/logos; sin logo usa un icono de Lucide. */
  logo?: string;
  connect: ConnectMethod;
  /** Para OAuth: con qué cuenta se autoriza. */
  provider?: string;
}

export const SOURCES: SourceDef[] = [
  { id: "upload", name: "Subir archivos", detail: "PDF, Word, fotos o escaneos, con cualquier estructura", connect: "none" },
  { id: "linkedin", name: "LinkedIn", detail: "Postulantes de tus vacantes publicadas", logo: "linkedin", connect: "oauth", provider: "LinkedIn" },
  { id: "computrabajo", name: "Computrabajo", detail: "Hojas de vida de tus ofertas activas", logo: "computrabajo", connect: "oauth", provider: "Computrabajo" },
  { id: "indeed", name: "Indeed", detail: "Postulaciones de tus avisos", logo: "indeed", connect: "oauth", provider: "Indeed" },
  { id: "greenhouse", name: "Greenhouse", detail: "Importa postulantes y escribe el puntaje de vuelta", logo: "greenhouse", connect: "api-key" },
  { id: "drive", name: "Google Drive", detail: "Una carpeta compartida con hojas de vida", logo: "gdrive", connect: "oauth", provider: "Google" },
  { id: "gmail", name: "Gmail", detail: "Adjuntos que llegan a un correo de selección", logo: "gmail", connect: "oauth", provider: "Google" },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id);
