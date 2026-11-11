"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Loader2, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type ToastTone = "success" | "error" | "progress";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Acción opcional a la derecha ("Deshacer", "Reintentar"). */
  action?: { label: string; onClick: () => void };
  /** ms; 0 = no se cierra sola (útil para "progress"). */
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
  leaving: boolean;
  duration: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Cuántos se ven a la vez; el más viejo sale cuando llega uno nuevo. */
const MAX_VISIBLE = 3;
/** Debe coincidir con la duración de la animación toast-out. */
const EXIT_MS = 320;

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CircleCheck aria-hidden className="size-[18px] text-success" />,
  error: <CircleAlert aria-hidden className="size-[18px] text-danger" />,
  progress: <Loader2 aria-hidden className="size-[18px] animate-spin text-amber" />,
};

/**
 * Toasts para confirmar acciones. Entran y salen con animación; al salir su
 * fila se cierra (grid 1fr → 0fr), así los demás se deslizan en vez de saltar.
 * Máximo tres a la vez. Pasar el ratón por encima pausa todos los temporizadores.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [paused, setPaused] = useState(false);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), EXIT_MS);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      const duration = input.duration ?? (input.tone === "progress" ? 0 : 5000);
      setItems((prev) => {
        const next = [...prev, { ...input, id, duration, leaving: false }];
        const alive = next.filter((t) => !t.leaving);
        const overflow = alive.length - MAX_VISIBLE;
        if (overflow <= 0) return next;
        const evict = new Set(alive.slice(0, overflow).map((t) => t.id));
        evict.forEach((eid) => window.setTimeout(() => setItems((p) => p.filter((t) => t.id !== eid)), EXIT_MS));
        return next.map((t) => (evict.has(t.id) ? { ...t, leaving: true } : t));
      });
      return id;
    },
    [],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        aria-label="Avisos"
        aria-live="polite"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="pointer-events-none fixed right-6 bottom-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col"
      >
        {items.map((t) => (
          <ToastRow key={t.id} item={t} paused={paused} onDismiss={dismiss} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

function ToastRow({ item, paused, onDismiss }: { item: ToastItem; paused: boolean; onDismiss: (id: number) => void }) {
  const remaining = useRef(item.duration);
  const startedAt = useRef(0);

  // Temporizador que se puede pausar: guarda lo que falta al pausar.
  useEffect(() => {
    if (item.leaving || item.duration <= 0) return;
    if (paused) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(() => onDismiss(item.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, item.leaving, item.duration, item.id, onDismiss]);

  return (
    <div
      className={cn(
        "grid",
        item.leaving ? "animate-[toast-collapse_320ms_var(--ease-in-out-soft)_forwards]" : "animate-[toast-expand_420ms_var(--ease-out-soft)_both]",
      )}
    >
      <div className="min-h-0 overflow-visible">
        <div
          role="status"
          className={cn(
            "pointer-events-auto relative mt-3 flex items-start gap-3 overflow-hidden rounded-xl border border-border-strong bg-panel px-4 py-3 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)]",
            item.leaving ? "animate-[toast-out_320ms_var(--ease-in-out-soft)_forwards]" : "animate-toast-in",
          )}
        >
          <span className="mt-px shrink-0">{toneIcon[item.tone ?? "success"]}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[13.5px] font-medium">{item.title}</p>
            {item.description ? <p className="text-[12.5px] text-ink-2">{item.description}</p> : null}
          </div>
          {item.action ? (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                onDismiss(item.id);
              }}
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[12.5px] font-medium transition-colors duration-300 hover:bg-white/10"
            >
              {item.action.label}
            </button>
          ) : (
            <button
              type="button"
              aria-label="Cerrar aviso"
              onClick={() => onDismiss(item.id)}
              className="shrink-0 rounded-md p-0.5 text-ink-muted-dark transition-colors duration-300 hover:bg-white/10 hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
          {item.duration > 0 ? (
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-white/25"
              style={{
                animation: `toast-timer ${item.duration}ms linear forwards`,
                animationPlayState: paused || item.leaving ? "paused" : "running",
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
