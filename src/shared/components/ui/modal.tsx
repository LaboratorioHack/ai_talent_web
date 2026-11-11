"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Botones del pie: normalmente un Botón Texto "Cancelar" y la acción principal. */
  footer?: ReactNode;
  size?: "sm" | "md";
  /** Si es false, Escape y el velo no cierran (p. ej. mientras se procesa). */
  dismissible?: boolean;
}

/**
 * Modal solo cuando hay que decidir o justificar. Usa <dialog> nativo: foco
 * atrapado, Escape para salir y velo oscuro con la tinta al 60 %.
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md", dismissible = true }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] overflow-visible rounded-2xl border border-border bg-surface p-0 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] backdrop:bg-black/60 backdrop:backdrop-blur-[2px]",
        "open:animate-pop-in backdrop:animate-fade-in",
        size === "sm" ? "max-w-[360px]" : "max-w-[440px]",
      )}
    >
      <div className="flex flex-col gap-5 p-6">
        <header className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 id={titleId} className="font-head text-[21px] leading-tight font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="text-sm text-ink-2">
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? (
            <button type="button" onClick={onClose} aria-label="Cerrar" className="-m-1 shrink-0 rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink">
              <X aria-hidden className="size-[18px]" />
            </button>
          ) : null}
        </header>
        {children}
        {footer ? <footer className="flex justify-end gap-2">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
