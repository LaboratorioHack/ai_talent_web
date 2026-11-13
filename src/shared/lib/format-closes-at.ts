import { formatLongDate, formatShortDate, fromISODate } from "./dates";

/** Fecha de cierre de vacante: la API manda "" si no hay cierre. */
export function formatVacancyClosesAt(closesAt: string, style: "short" | "long" = "short"): string {
  if (!closesAt.trim()) return "Sin fecha de cierre";
  const date = fromISODate(closesAt);
  if (!date) return "Sin fecha de cierre";
  return style === "long" ? formatLongDate(date) : formatShortDate(date);
}
