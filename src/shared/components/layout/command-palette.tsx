"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CornerDownLeft, FileText, LayoutGrid, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface SearchItem {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group: "Páginas" | "Vacantes" | "Candidatos";
}

const GROUP_ICON = { Páginas: LayoutGrid, Vacantes: Briefcase, Candidatos: FileText } as const;
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: SearchItem[];
}

/**
 * Buscador rápido (Ctrl K): páginas, vacantes y candidatos. Flechas para
 * moverse, Enter para abrir, Escape para salir.
 */
export function CommandPalette({ open, onClose, items }: CommandPaletteProps) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      input.current?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list = q ? items.filter((i) => normalize(`${i.label} ${i.hint ?? ""}`).includes(q)) : items.filter((i) => i.group === "Páginas");
    return list.slice(0, 12);
  }, [items, query]);

  function go(item: SearchItem | undefined) {
    if (!item) return;
    onClose();
    setQuery("");
    router.push(item.href);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Buscar"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="mx-auto mt-[12vh] w-[calc(100vw-2rem)] max-w-[580px] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] backdrop:bg-panel/40 backdrop:backdrop-blur-[3px] open:animate-pop-in backdrop:animate-fade-in"
    >
      <div className="flex items-center gap-3 border-b border-border px-5">
        <Search aria-hidden className="size-[18px] text-ink-3" />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Busca una vacante, un candidato o una página"
          role="combobox"
          aria-expanded
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
          className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
        />
        <kbd className="rounded-md border border-border px-1.5 py-0.5 font-sans text-[11px] text-ink-3">Esc</kbd>
      </div>

      <ul id="palette-results" role="listbox" className="max-h-[380px] overflow-y-auto p-2">
        {results.length === 0 ? <li className="px-3 py-8 text-center text-sm text-ink-3">Nada coincide con “{query}”.</li> : null}
        {results.map((item, i) => {
          const Icon = GROUP_ICON[item.group];
          const header = i === 0 || results[i - 1].group !== item.group ? item.group : null;
          return (
            <li key={item.id} role="presentation">
              {header ? <p className="px-3 pt-3 pb-1.5 text-xs text-ink-3">{header}</p> : null}
              <button
                id={`palette-${item.id}`}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150", i === active ? "bg-surface-2" : "")}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-ink-2 ring-1 ring-border">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-medium">{item.label}</span>
                  {item.hint ? <span className="truncate text-xs text-ink-3">{item.hint}</span> : null}
                </span>
                <CornerDownLeft aria-hidden className={cn("size-3.5 text-ink-3 transition-opacity", i === active ? "opacity-100" : "opacity-0")} />
              </button>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
