"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
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
}

interface ToastContextValue {
  toast: (input: ToastInput) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CircleCheck aria-hidden className="size-[18px] text-[#8FD3A9]" />,
  error: <CircleAlert aria-hidden className="size-[18px] text-[#F3A49A]" />,
  progress: <Loader2 aria-hidden className="size-[18px] animate-spin text-amber" />,
};

/** Toasts para confirmar acciones. Se montan una vez en el layout raíz. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setItems((prev) => [...prev, { ...input, id }]);
      const duration = input.duration ?? (input.tone === "progress" ? 0 : 5000);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-6 bottom-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-lg bg-panel px-4 py-3 text-ink-inverse shadow-lg animate-[toast-in_180ms_ease-out]"
          >
            <span className="mt-px shrink-0">{toneIcon[t.tone ?? "success"]}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[13.5px] font-medium">{t.title}</p>
              {t.description ? <p className="text-[12.5px] text-[#C9C9C4]">{t.description}</p> : null}
            </div>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 text-[12.5px] underline-offset-2 hover:underline"
              >
                {t.action.label}
              </button>
            ) : (
              <button type="button" aria-label="Cerrar aviso" onClick={() => dismiss(t.id)} className={cn("shrink-0 text-ink-muted-dark hover:text-ink-inverse")}>
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
