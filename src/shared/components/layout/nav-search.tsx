"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CornerDownLeft, FileText, LayoutGrid, Search } from "lucide-react";
import { usePresence } from "@/shared/hooks/use-presence";
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

export interface NavSearchProps {
  items: SearchItem[];
  /** Avisa cuando se abre o se cierra, para que la barra aparte lo demás. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Buscador de la barra. Al enfocarlo (clic o Ctrl K) se ensancha en su sitio y
 * despliega los resultados debajo; la barra aparta las secciones mientras
 * tanto. Clic fuera, Escape o scroll lo devuelven a su tamaño.
 */
export function NavSearch({ items, onOpenChange }: NavSearchProps) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const { mounted, state } = usePresence(open, 180);

  function change(next: boolean) {
    setOpen(next);
    onOpenChange(next);
    if (!next) input.current?.blur();
  }

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      onOpenChange(false);
      input.current?.blur();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", close);
    };
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list = q ? items.filter((i) => normalize(`${i.label} ${i.hint ?? ""}`).includes(q)) : items.filter((i) => i.group === "Páginas");
    return list.slice(0, 9);
  }, [items, query]);

  function go(item: SearchItem | undefined) {
    if (!item) return;
    change(false);
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
    } else if (e.key === "Escape") {
      change(false);
    }
  }

  return (
    <div ref={root} className="relative">
      <div
        className={cn(
          "flex h-11 items-center gap-2.5 rounded-full border bg-surface pr-2 pl-4 text-[14px] transition-[width,border-color,box-shadow] duration-500 ease-[var(--ease-spring)]",
          open ? "w-[min(560px,44vw)] border-border-strong shadow-[0_0_0_4px_rgba(242,169,59,0.16),0_16px_36px_-20px_rgba(21,32,27,0.45)]" : "w-[250px] border-border shadow-[0_1px_2px_rgba(21,32,27,0.04)] hover:border-border-strong 2xl:w-[300px]",
        )}
      >
        <Search aria-hidden className={cn("size-[18px] shrink-0 transition-colors duration-300", open ? "text-ink" : "text-ink-3")} />
        <input
          ref={input}
          value={query}
          onFocus={() => !open && change(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={open ? "Busca una vacante, un candidato o una página" : "Buscar"}
          role="combobox"
          aria-expanded={open}
          aria-controls="nav-search-results"
          aria-activedescendant={open && results[active] ? `nav-search-${results[active].id}` : undefined}
          aria-label="Buscar"
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-3"
        />
        <kbd className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 font-sans text-[11.5px] text-ink-3 ring-1 ring-border">{open ? "Esc" : "Ctrl K"}</kbd>
      </div>

      {mounted ? (
        <ul
          id="nav-search-results"
          role="listbox"
          data-state={state}
          className="absolute top-[calc(100%+10px)] right-0 z-50 max-h-[420px] w-full overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-[0_30px_60px_-30px_rgba(21,32,27,0.55)] origin-top data-[state=open]:animate-[menu-in_260ms_var(--ease-out-soft)_both] data-[state=closed]:animate-[menu-out_160ms_var(--ease-in-out-soft)_both]"
        >
          {results.length === 0 ? <li className="px-3 py-8 text-center text-sm text-ink-3">Nada coincide con “{query}”.</li> : null}
          {results.map((item, i) => {
            const Icon = GROUP_ICON[item.group];
            const header = i === 0 || results[i - 1].group !== item.group ? item.group : null;
            return (
              <li key={item.id} role="presentation" className="animate-[option-in_260ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 22}ms` }}>
                {header ? <p className="px-3 pt-3 pb-1.5 text-xs text-ink-3">{header}</p> : null}
                <button
                  id={`nav-search-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150", i === active && "bg-surface-2")}
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
      ) : null}
    </div>
  );
}
