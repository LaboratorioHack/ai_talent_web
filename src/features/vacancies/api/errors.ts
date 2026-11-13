import { ApiError } from "@/shared/lib/api-client";

/** Mensajes de la API de vacantes (ProblemDetails en inglés) → lo que lee la persona. */
const RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/weights must add up to 100 \(currently ([\d.,]+)\)/i, (m) => `Los pesos de obligatorios y deseables deben sumar 100 para publicar; ahora suman ${m[1]}.`],
  [/at least one requirement/i, () => "Agrega al menos un requisito antes de publicar."],
  [/closing date must be in the future/i, () => "La fecha de cierre tiene que ser futura."],
  [/only draft vacancies can be published/i, () => "Esta vacante ya está publicada."],
  [/title is required/i, () => "Ponle nombre a la vacante (máximo 80 caracteres)."],
  [/area must be/i, () => "Elige un área válida."],
  [/positions must be/i, () => "El número de vacantes debe estar entre 1 y 50."],
  [/description must be at most/i, () => "La descripción es demasiado larga."],
  [/requirement (\d+): description is required/i, (m) => `Escribe el requisito ${m[1]}.`],
  [/requirement (\d+): weight is required/i, (m) => `El peso del requisito ${m[1]} debe estar entre 0 y 100.`],
  [/requirement (\d+): .*equivalence/i, (m) => `Revisa las equivalencias del requisito ${m[1]}.`],
  [/modality must be/i, () => "Elige una modalidad válida."],
  [/must be between 2 and 80 characters/i, () => "Revisa los datos de publicación: cada uno tiene entre 2 y 80 caracteres."],
];

/** Mensaje legible para un error al guardar o publicar una vacante. */
export function vacancyErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Revisa tu conexión e inténtalo de nuevo.";
  if (error.status === 403) return "Tu cuenta todavía no pertenece a una organización.";
  if (error.status === 404) return "Esta vacante ya no existe.";
  for (const [pattern, text] of RULES) {
    const match = error.message.match(pattern);
    if (match) return text(match);
  }
  return "No se pudo guardar. Inténtalo de nuevo en un momento.";
}
