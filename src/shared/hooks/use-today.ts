"use client";

import { useSyncExternalStore } from "react";
import { fromISODate, toISODate } from "@/shared/lib/dates";

const subscribe = () => () => undefined;
const getClientSnapshot = () => toISODate(new Date());
const getServerSnapshot = () => null;

/**
 * Fecha de hoy (inicio del día) o null durante el prerender. Cache Components
 * prohíbe `new Date()` en el render de un Client Component; con
 * useSyncExternalStore el servidor devuelve null y el cliente el día real.
 */
export function useToday(): Date | null {
  const iso = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  return iso ? fromISODate(iso) : null;
}
