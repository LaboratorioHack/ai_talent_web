import { clsx, type ClassValue } from "clsx";

/** Une clases condicionales. Sin tailwind-merge: evitamos pasar clases en conflicto. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
