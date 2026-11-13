"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, RefreshCw, X } from "lucide-react";
import { CribaAi } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { placeOf, type PortalJob } from "../../types/portal";
import { MATCH_LABEL, matchReason } from "./recommended-jobs";

const PER_BATCH = 3;
const LEAVE_MS = 260;

/**
 * "Para ti": tres vacantes que Criba AI elige por la hoja de vida. Si no
 * convencen, "Recomiéndame otras" trae la siguiente tanda y "No me interesa"
 * cambia solo esa tarjeta. Nunca puntajes: afinidad en palabras y el porqué.
 */
export function ForYou({ jobs }: { jobs: PortalJob[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const [batch, setBatch] = useState(0);
  const [leaving, setLeaving] = useState<"all" | string | null>(null);

  const pool = useMemo(
    // Solo las que Criba AI comparó con su hoja de vida y tienen algo en común.
    () => jobs.filter((j) => !j.applied && !dismissed.has(j.id) && j.match && j.match.level !== "baja"),
    [jobs, dismissed],
  );
  const picks = useMemo(() => {
    if (!pool.length) return [];
    const n = Math.min(PER_BATCH, pool.length);
    return Array.from(
      { length: n },
      (_, i) => pool[(offset + i) % pool.length],
    );
  }, [pool, offset]);
  const batches = Math.max(1, Math.ceil(pool.length / PER_BATCH));
  const current = Math.floor(offset / PER_BATCH) % batches;

  function next() {
    if (leaving) return;
    setLeaving("all");
    window.setTimeout(() => {
      setOffset((o) => (o + PER_BATCH >= pool.length ? 0 : o + PER_BATCH));
      setBatch((b) => b + 1);
      setLeaving(null);
    }, LEAVE_MS);
  }

  function dismiss(id: string) {
    if (leaving) return;
    setLeaving(id);
    window.setTimeout(() => {
      setDismissed((s) => new Set(s).add(id));
      setLeaving(null);
    }, LEAVE_MS);
  }

  if (!picks.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex flex-wrap items-center gap-2 font-head text-[22px] font-semibold tracking-[-0.01em]">
            Para ti
            <CribaAi label="Las eligió por tu hoja de vida" />
          </h2>
          <p className="text-[13.5px] text-ink-3">
            Afinidad en palabras, no un puntaje. Postúlate a las que te
            interesen.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {batches > 1 ? (
            <span
              aria-label={`Tanda ${current + 1} de ${batches}`}
              className="flex items-center gap-1.5"
            >
              {Array.from({ length: batches }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-out-soft)]",
                    i === current ? "w-5 bg-amber" : "w-1.5 bg-border-strong",
                  )}
                />
              ))}
            </span>
          ) : null}
          <button
            type="button"
            onClick={next}
            disabled={pool.length <= PER_BATCH}
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-[13.5px] font-medium ring-1 ring-border transition-[box-shadow,transform,translate,opacity] duration-300 hover:-translate-y-px hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)] disabled:pointer-events-none disabled:opacity-40"
          >
            <RefreshCw
              aria-hidden
              className={cn(
                "size-4 text-amber transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-90",
                leaving === "all" && "rotate-180",
              )}
            />
            Recomiéndame otras
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {picks.map((j, i) => {
          const m = MATCH_LABEL[j.match!.level];
          const out = leaving === "all" || leaving === j.id;
          return (
            <li
              key={`${batch}-${j.id}`}
              className="animate-rise"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div
                className={cn(
                  "h-full transition-[opacity,translate,scale] duration-[260ms] ease-[var(--ease-out-soft)]",
                  out && "translate-y-2 scale-[0.98] opacity-0",
                )}
              >
                <article className="panel group relative flex h-full flex-col gap-4 p-5 transition-[box-shadow,transform,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_rgba(0,0,0,0.55)]">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden
                      className="flex size-11 items-center justify-center rounded-xl bg-surface-2 font-head text-[14px] font-semibold text-ink-2 ring-1 ring-border"
                    >
                      {j.company
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <button
                      type="button"
                      onClick={() => dismiss(j.id)}
                      aria-label={`No me interesa ${j.title}`}
                      title="No me interesa"
                      className="relative z-10 flex size-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
                    >
                      <X aria-hidden className="size-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-head text-[18px] leading-tight font-semibold tracking-[-0.01em]">
                      <Link
                        href={routes.apply(j.id)}
                        className="after:absolute after:inset-0 after:rounded-[inherit]"
                      >
                        {j.title}
                      </Link>
                    </h3>
                    <p className="flex items-center gap-1.5 text-[13px] text-ink-3">
                      {j.company}
                      {placeOf(j) ? (
                        <>
                          <span aria-hidden>·</span>
                          <MapPin aria-hidden className="size-3.5" />
                          {placeOf(j)}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <p className="text-[13.5px] leading-snug text-ink-2">
                    {matchReason(j)}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[12px] font-medium",
                        m.tone,
                      )}
                    >
                      {m.label}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </article>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
