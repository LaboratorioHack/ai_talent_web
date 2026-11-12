"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PublicRequirement } from "../types/public";

/**
 * "¿Encajas?": la persona marca lo que tiene y ve si le conviene postularse.
 * No se guarda ni se envía; solo orienta.
 */
export function FitCheck({ mandatory }: { mandatory: PublicRequirement[] }) {
  const [have, setHave] = useState<string[]>([]);
  const n = have.length;
  const all = n === mandatory.length;
  const message =
    n === 0
      ? "Marca lo que ya tienes. Nadie ve estas marcas: solo te orientan."
      : all
        ? "Tienes todo lo obligatorio. Postúlate."
        : `Tienes ${n} de ${mandatory.length} obligatorios. Si tu experiencia es parecida, igual cuenta: postúlate y una persona lo revisa.`;

  return (
    <section className="card flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-head text-[18px] font-semibold tracking-[-0.01em]">¿Encajas?</h2>
        <span className="text-[12.5px] text-ink-3 tabular-nums">
          {n} de {mandatory.length}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {mandatory.map((r) => {
          const on = have.includes(r.text);
          return (
            <li key={r.text}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setHave((h) => (on ? h.filter((x) => x !== r.text) : [...h, r.text]))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[14px] transition-[background-color,border-color] duration-300",
                  on ? "border-success/40 bg-success-soft/60" : "border-border hover:bg-hover",
                )}
              >
                <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-300", on ? "border-success bg-success text-ink-inverse" : "border-border-strong")}>
                  {on ? <Check aria-hidden className="size-3.5 animate-[pop-in_300ms_var(--ease-spring)_both]" /> : null}
                </span>
                {r.text}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2">
        <span className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
          <span className={cn("h-full rounded-full transition-[width,background-color] duration-700 ease-[var(--ease-out-soft)]", all ? "bg-success" : "bg-amber")} style={{ width: `${(n / Math.max(1, mandatory.length)) * 100}%` }} />
        </span>
        <p key={message} className={cn("text-[13px] animate-[fade-in_300ms_var(--ease-out-soft)_both]", all ? "text-success" : "text-ink-2")}>
          {message}
        </p>
      </div>
    </section>
  );
}
