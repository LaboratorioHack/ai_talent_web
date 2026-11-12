import type { PublicJob, PublicRequirement } from "../types/public";

/**
 * Lo que la vacante no dice con todas las letras pero se deduce de su título y
 * sus requisitos. Se muestra como orientación para quien se postula.
 */
export type Level = "Junior" | "Intermedio" | "Senior" | "Líder";

export function inferLevel(title: string): Level {
  if (/\b(senior|sr)\b/i.test(title)) return "Senior";
  if (/\b(junior|jr)\b/i.test(title)) return "Junior";
  if (/\b(líder|lider|lead|jefe|head)\b/i.test(title)) return "Líder";
  return "Intermedio";
}

const EXPERIENCE: Record<Level, string> = {
  Junior: "0 a 2 años",
  Intermedio: "2 a 4 años",
  Senior: "5 años o más",
  Líder: "5 años o más",
};

/** Años de experiencia: los que pida un requisito, o los típicos del nivel. */
export function inferExperience(job: PublicJob): { value: string; inferred: boolean } {
  for (const r of job.mandatory) {
    const m = /(\d+)\s*años/i.exec(r.text);
    if (m) return { value: `${m[1]} años o más`, inferred: false };
  }
  return { value: EXPERIENCE[inferLevel(job.title)], inferred: true };
}

export function inferLanguage(job: PublicJob): string | null {
  const r = [...job.mandatory, ...job.desirable].find((x) => x.category === "Idiomas");
  return r ? r.text : null;
}

export type RequirementGroup = "Experiencia" | "Conocimientos" | "Idiomas" | "Formación" | "Sector";

export function groupOf(r: PublicRequirement): RequirementGroup {
  const c = r.category.toLowerCase();
  if (c.includes("experiencia")) return "Experiencia";
  if (c.includes("idioma")) return "Idiomas";
  if (c.includes("educ") || c.includes("certific")) return "Formación";
  if (c.includes("sector")) return "Sector";
  return "Conocimientos";
}

/** "GCP o AWS también cuentan". */
export function alsoCountsText(r: PublicRequirement): string | null {
  if (!r.alsoCounts.length) return null;
  const list = r.alsoCounts.length === 1 ? r.alsoCounts[0] : `${r.alsoCounts.slice(0, -1).join(", ")} o ${r.alsoCounts.at(-1)}`;
  return `${list} también ${r.alsoCounts.length === 1 ? "cuenta" : "cuentan"}`;
}
