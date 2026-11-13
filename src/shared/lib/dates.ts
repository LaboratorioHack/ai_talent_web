const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export const WEEKDAYS_ES = ["L", "M", "X", "J", "V", "S", "D"];

/** "30 / 11 / 2026" */
export function formatDateDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d} / ${m} / ${date.getFullYear()}`;
}

/** "Noviembre 2026" */
export function formatMonthYear(date: Date): string {
  const month = MONTHS_ES[date.getMonth()];
  return `${month[0].toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

/** "30 de noviembre", para frases. */
export function formatLongDate(date: Date): string {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]}`;
}

/** "30 nov" */
export function formatShortDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS_ES[date.getMonth()].slice(0, 3)}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Rejilla del mes empezando en lunes; null = celda vacía. */
export function monthGrid(month: Date): (Date | null)[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** ISO corto "2026-11-30" para formularios y API. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function fromISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Zona de la organización: servidor y navegador formatean igual, sin errores de hidratación. */
export const APP_TIME_ZONE = "America/Bogota";

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Instante ISO → "23 oct a las 06:54" en la hora de Bogotá (igual en el servidor y en el navegador). */
export function formatDayTime(iso: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: APP_TIME_ZONE, day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.day} ${MONTHS_SHORT[Number(parts.month) - 1]} a las ${parts.hour}:${parts.minute}`;
}
