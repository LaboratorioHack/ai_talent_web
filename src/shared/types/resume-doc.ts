/**
 * Hoja de vida lista para mostrarse como documento. La arma el AI Engine a
 * partir del archivo leído (professional_data + fragmentos); cada línea puede
 * llevar la nota de revisión del requisito que prueba.
 */
export interface ResumeNote {
  requirement: string;
  points: number;
  partial?: boolean;
}

export interface ResumeLine {
  kind: "role" | "bullet" | "text";
  text: string;
  /** Fechas u otro dato alineado a la derecha (solo en "role"). */
  right?: string;
  note?: ResumeNote;
}

export interface ResumeSection {
  title: string;
  lines: ResumeLine[];
}

export interface ResumeDoc {
  name: string;
  headline: string;
  /** Correo, teléfono, ciudad: cada dato por separado. */
  contact: string[];
  sections: ResumeSection[];
  /** Página de origen de cada nota, para citarla ("CV pág. 1"). */
  pages?: number;
}
