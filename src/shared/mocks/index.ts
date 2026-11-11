export * from "./organization";
export * from "./vacancies";
export * from "./applications";
export * from "./interviews";
export * from "./integrations";
export * from "./governance";
export * from "./resume-docs";
export * from "./candidates";

/** Simula latencia de red para que los estados de carga se vean en desarrollo. */
export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
