"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Download, Loader2, Maximize2, Minus, Plus } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/shared/lib/cn";

/** Zona clicable sobre el PDF, en puntos con origen arriba a la izquierda. */
export interface PdfHotspot {
  key: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export interface PdfViewerProps {
  /** Bytes del PDF; null mientras se genera o descarga. */
  data: Uint8Array | null;
  fileName: string;
  hotspots?: PdfHotspot[];
  activeKey?: string | null;
  onHotspot?: (spot: PdfHotspot) => void;
  /** Capa propia por página (por ejemplo, el editor flotante), en píxeles de la página ya escalada. */
  renderOverlay?: (page: number, scale: number) => ReactNode;
  toolbarEnd?: ReactNode;
  /** Muestra la columna de miniaturas. */
  thumbnails?: boolean;
  className?: string;
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((m) => {
    m.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    return m;
  });
  return pdfjsPromise;
}

const ZOOMS = [0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2];

/**
 * Lector de PDF de Criba (pdf.js): páginas nítidas, miniaturas, zoom, página
 * actual y descarga. Al cambiar el archivo vuelve a pintar sin parpadeo (cada
 * página se dibuja aparte y se copia al terminar).
 */
export function PdfViewer({ data, fileName, hotspots = [], activeKey, onHotspot, renderOverlay, toolbarEnd, thumbnails = true, className }: PdfViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<{ w: number; h: number }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const pages = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    loadPdfjs()
      .then((pdfjs) => pdfjs.getDocument({ data: data.slice() }).promise)
      .then(async (doc) => {
        const s = await Promise.all(
          Array.from({ length: doc.numPages }, async (_, i) => {
            const v = (await doc.getPage(i + 1)).getViewport({ scale: 1 });
            return { w: v.width, h: v.height };
          }),
        );
        if (cancelled) return;
        setPdf(doc);
        setSizes(s);
        setError(false);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fit = sizes[0] && width ? Math.min(1.6, (width - 48) / sizes[0].w) : 1;
  const scale = fit * zoom;

  useEffect(() => {
    const root = area.current;
    if (!root || !sizes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setCurrent(Number((best.target as HTMLElement).dataset.page));
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    );
    pages.current.forEach((p) => p && io.observe(p));
    return () => io.disconnect();
  }, [sizes.length]);

  const download = useCallback(() => {
    if (!data) return;
    const url = URL.createObjectURL(new Blob([data.slice().buffer as ArrayBuffer], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, fileName]);

  const zoomIndex = ZOOMS.indexOf(zoom);
  const goTo = (i: number) => pages.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-2/60", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/80 px-3 py-2 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5 pl-1">
          <span className="rounded-[4px] bg-danger px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-white">PDF</span>
          <span className="truncate text-[13px] font-medium">{fileName}</span>
          {pdf ? (
            <span className="shrink-0 text-[12.5px] text-ink-3 tabular-nums">
              {current + 1} / {pdf.numPages}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Alejar" disabled={zoomIndex <= 0} onClick={() => setZoom(ZOOMS[zoomIndex - 1])} className="flex size-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-hover hover:text-ink disabled:opacity-40">
            <Minus aria-hidden className="size-4" />
          </button>
          <span className="w-12 text-center text-[12.5px] text-ink-2 tabular-nums">{Math.round(zoom * 100)} %</span>
          <button type="button" aria-label="Acercar" disabled={zoomIndex >= ZOOMS.length - 1} onClick={() => setZoom(ZOOMS[zoomIndex + 1])} className="flex size-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-hover hover:text-ink disabled:opacity-40">
            <Plus aria-hidden className="size-4" />
          </button>
          <button type="button" aria-label="Ajustar al ancho" onClick={() => setZoom(1)} className="flex size-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-hover hover:text-ink">
            <Maximize2 aria-hidden className="size-3.5" />
          </button>
          <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          <button type="button" aria-label="Descargar PDF" onClick={download} disabled={!data} className="flex size-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-hover hover:text-ink disabled:opacity-40">
            <Download aria-hidden className="size-4" />
          </button>
          {toolbarEnd}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {thumbnails && pdf ? (
          <div className="hidden w-[104px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-border p-3 md:flex">
            {sizes.map((s, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Página ${i + 1}`} className="flex flex-col items-center gap-1.5">
                <span className={cn("block overflow-hidden rounded-[2px] bg-white ring-2 transition-[box-shadow] duration-300", current === i ? "ring-amber" : "ring-transparent")} style={{ width: 76, height: (s.h * 76) / s.w }}>
                  <PdfCanvas pdf={pdf} page={i} scale={76 / s.w} />
                </span>
                <span className={cn("text-[11px] tabular-nums", current === i ? "text-ink" : "text-ink-3")}>{i + 1}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div ref={area} className="relative min-h-0 flex-1 overflow-auto">
          {error ? (
            <p className="p-10 text-center text-[14px] text-ink-3">No se pudo abrir el PDF.</p>
          ) : !pdf || !width ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-ink-3">
              <Loader2 aria-hidden className="size-5 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 px-6 py-6">
              {sizes.map((s, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    pages.current[i] = el;
                  }}
                  data-page={i}
                  className="relative shrink-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_40px_-20px_rgba(0,0,0,0.55)]"
                  style={{ width: s.w * scale, height: s.h * scale }}
                >
                  <PdfCanvas pdf={pdf} page={i} scale={scale} />
                  {hotspots
                    .filter((h) => h.page === i)
                    .map((h) => (
                      <button
                        key={h.key}
                        type="button"
                        aria-label={h.label ?? "Editar línea"}
                        onClick={() => onHotspot?.(h)}
                        className={cn(
                          "absolute rounded-[3px] transition-[background-color,box-shadow] duration-200",
                          activeKey === h.key ? "bg-amber/20 shadow-[0_0_0_2px_var(--amber)]" : "hover:bg-amber/10 hover:shadow-[0_0_0_1.5px_rgba(242,169,59,0.8)]",
                        )}
                        style={{ left: h.x * scale, top: h.y * scale, width: h.w * scale, height: h.h * scale }}
                      />
                    ))}
                  {renderOverlay?.(i, scale)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Una página del PDF en un canvas. Dibuja en uno aparte y copia al terminar, así no parpadea. */
function PdfCanvas({ pdf, page, scale }: { pdf: PDFDocumentProxy; page: number; scale: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = useMemo(() => (typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1)), []);

  useEffect(() => {
    let cancelled = false;
    let task: { cancel: () => void } | null = null;
    pdf.getPage(page + 1).then((p) => {
      if (cancelled) return;
      const viewport = p.getViewport({ scale: scale * dpr });
      const off = document.createElement("canvas");
      off.width = Math.ceil(viewport.width);
      off.height = Math.ceil(viewport.height);
      const ctx = off.getContext("2d");
      if (!ctx) return;
      const t = p.render({ canvasContext: ctx, viewport });
      task = t;
      t.promise
        .then(() => {
          const c = ref.current;
          if (cancelled || !c) return;
          c.width = off.width;
          c.height = off.height;
          c.getContext("2d")?.drawImage(off, 0, 0);
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, page, scale, dpr]);

  return <canvas ref={ref} className="block h-full w-full" style={{ width: "100%" }} />;
}

/** Primera página de un PDF como miniatura nítida (sin barra ni controles). */
export function PdfFirstPage({ data, width, className }: { data: Uint8Array | null; width: number; className?: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    loadPdfjs()
      .then((pdfjs) => pdfjs.getDocument({ data: data.slice() }).promise)
      .then(async (doc) => {
        const v = (await doc.getPage(1)).getViewport({ scale: 1 });
        if (cancelled) return;
        setPdf(doc);
        setSize({ w: v.width, h: v.height });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [data]);

  const height = size ? (size.h * width) / size.w : width * 1.414;
  return (
    <div className={cn("relative overflow-hidden bg-white", className)} style={{ width, height }}>
      {pdf && size ? <PdfCanvas pdf={pdf} page={0} scale={width / size.w} /> : <span className="skeleton absolute inset-0" />}
    </div>
  );
}
