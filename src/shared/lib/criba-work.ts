import { useEffect, useSyncExternalStore } from "react";

/**
 * Lo que Criba AI está haciendo ahora mismo en esta pestaña. Cada pantalla que
 * llama a la IA (proponer requisitos, leer, evaluar, comparar) anota aquí su
 * trabajo, y `CribaPresence` lo muestra mientras dura. Así la IA se nota cuando
 * actúa, sin que cada pantalla invente su propio indicador.
 */
export type CribaMood = "idle" | "reading" | "thinking" | "talking" | "done";

export interface CribaJob {
  id: number;
  label: string;
  mood: CribaMood;
}

let jobs: readonly CribaJob[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: readonly CribaJob[] = [];

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Anota un trabajo de la IA; devuelve la función que lo da por terminado. */
export function startCribaWork(label: string, mood: CribaMood = "thinking"): () => void {
  const id = nextId++;
  jobs = [...jobs, { id, label, mood }];
  emit();
  return () => {
    jobs = jobs.filter((job) => job.id !== id);
    emit();
  };
}

/** Envuelve una llamada a la IA: se ve mientras corre y desaparece al terminar, falle o no. */
export async function withCriba<T>(label: string, work: Promise<T>, mood: CribaMood = "thinking"): Promise<T> {
  const done = startCribaWork(label, mood);
  try {
    return await work;
  } finally {
    done();
  }
}

/** Para trabajos que duran lo que dura un estado (p. ej. hojas de vida en lectura). */
export function useCribaWork(active: boolean, label: string, mood: CribaMood = "thinking"): void {
  useEffect(() => (active ? startCribaWork(label, mood) : undefined), [active, label, mood]);
}

export function useCribaJobs(): readonly CribaJob[] {
  return useSyncExternalStore(subscribe, () => jobs, () => EMPTY);
}
