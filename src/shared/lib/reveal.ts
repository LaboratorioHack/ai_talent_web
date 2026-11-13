/**
 * Lo que produce Criba AI no aparece de golpe: entra de a uno, con una pausa
 * corta, como si se fuera escribiendo. Con «reducir movimiento» entra todo junto.
 */

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, reducedMotion() ? 0 : ms));

/** Muestra cada elemento con `show`, esperando `gap` ms entre uno y otro. */
export async function revealEach<T>(items: readonly T[], show: (item: T, index: number) => void, gap = 420): Promise<void> {
  for (const [index, item] of items.entries()) {
    if (index > 0) await pause(gap);
    show(item, index);
  }
}
