import { ApiError } from "@/shared/lib/api-client";
import { browserApi } from "@/shared/lib/api-browser";

/** Tamaños que acepta la API (y la restricción de la base de datos), con su texto para la persona. */
export const COMPANY_SIZES = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "501-1000", label: "501–1.000" },
  { value: "1000+", label: "Más de 1.000" },
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number]["value"];

export const isCompanySize = (value: string): value is CompanySize => COMPANY_SIZES.some((s) => s.value === value);

export const companySizeLabel = (value: string) => COMPANY_SIZES.find((s) => s.value === value)?.label ?? value;

export interface CompanyInput {
  name: string;
  sector: string;
  size: CompanySize;
  /** Nombre de la persona: la cuenta nace del enlace del correo y no trae nombre. */
  yourName: string;
}

/**
 * Crea la organización y deja a la persona como admin: POST /companies.
 * Si ya pertenece a una empresa (409), sigue el alta.
 */
export async function createCompany(input: CompanyInput): Promise<void> {
  try {
    await browserApi("/companies", { method: "POST", body: JSON.stringify({ companyName: input.name, sector: input.sector, size: input.size, yourName: input.yourName }) });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return;
    throw error;
  }
}

/** Mensaje legible al crear la organización (la API responde en inglés). */
export function companyErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Revisa tu conexión e inténtalo de nuevo.";
  if (/sector/i.test(error.message)) return "Elige el sector de la organización.";
  if (/size/i.test(error.message)) return "Elige el tamaño de la organización.";
  if (/name/i.test(error.message)) return "Escribe el nombre de la organización (máximo 120 caracteres).";
  return "No pudimos crear la organización. Inténtalo de nuevo.";
}

export type JoinResult = { ok: true } | { ok: false; message: string };

/**
 * Entra como reclutador a la empresa que emitió el código: POST /companies/join.
 * La API responde igual a un código vencido, alterado o desconocido.
 */
export async function joinCompany(code: string, yourName: string): Promise<JoinResult> {
  try {
    await browserApi("/companies/join", { method: "POST", body: JSON.stringify({ code: code.trim(), yourName }) });
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) return { ok: false, message: "No pudimos conectarnos. Intenta de nuevo" };
    // Ya pertenece a una empresa: el panel es su sitio.
    if (error.status === 409) return { ok: true };
    if (error.status === 429) return { ok: false, message: "Hiciste demasiados intentos. Espera 15 minutos" };
    if (error.status === 400) return { ok: false, message: "El código no es válido o ya venció. Pide uno nuevo a quien administra tu organización" };
    return { ok: false, message: "No pudimos unirte a la organización. Intenta de nuevo" };
  }
}
