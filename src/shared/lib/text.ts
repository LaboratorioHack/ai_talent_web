/**
 * Textos que vienen de la IA o de una hoja de vida, listos para mostrar: sin
 * marcadores de anonimización, sin letras espaciadas ("P E R F I L") y con
 * mayúscula inicial. Solo cambia la presentación, nunca el sentido.
 */

/** "código, observabilidad" → "Código, observabilidad". */
export const sentenceCase = (text: string) => (text ? text.charAt(0).toLocaleUpperCase("es") + text.slice(1) : text);

/** Limpia una cita de la hoja de vida para leerla de un vistazo. */
export function tidyQuote(text: string): string {
  const tidy = text
    .replace(/^[“"«]|[”"»]$/g, "")
    // Marcadores que deja la anonimización: no aportan al leer la evidencia.
    .replace(/\[(?:CANDIDATE|EMAIL|PHONE|ID|AGE|DOB|ADDRESS)\]/g, " ")
    // Títulos con letras espaciadas: "P E R F I L" → "PERFIL".
    .replace(/\b(?:\p{L} ){2,}\p{L}\b/gu, (m) => m.replace(/ /g, ""))
    .replace(/^[\s·•,;:–—-]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  return sentenceCase(tidy);
}
