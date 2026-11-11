"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IngestFile, IngestSource, IngestStatus } from "../types/ingest";

export interface IncomingFile {
  name: string;
  sizeKb: number;
}

const READABLE = new Set(["PDF", "DOC", "DOCX", "ODT", "RTF", "TXT", "JPG", "JPEG", "PNG", "HEIC", "WEBP", "TIFF"]);
const IMAGE = new Set(["JPG", "JPEG", "PNG", "HEIC", "WEBP", "TIFF"]);

const kindOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase() : "ARCHIVO");
const base = (name: string) => name.toLowerCase().replace(/\s*\(\d+\)/, "").replace(/\.[^.]+$/, "");

/** Decide qué "leyó" Criba según el archivo (simulación mientras no exista la API). */
function verdict(file: IngestFile, existing: IngestFile[]): Pick<IngestFile, "status" | "detail" | "pages"> {
  const kind = file.kind;
  if (!READABLE.has(kind)) return { status: "UNSUPPORTED", detail: kind === "ZIP" || kind === "RAR" ? "Comprimido: descomprímelo y sube los archivos" : `Formato ${kind} no soportado`, pages: 0 };
  const twin = existing.find((f) => f.id !== file.id && f.status === "READ" && base(f.name) === base(file.name));
  if (twin) return { status: "DUPLICATE", detail: `Igual a ${twin.name}`, pages: twin.pages };
  if (/carta|cover|certificado/i.test(file.name)) return { status: "NO_DATA", detail: "No parece una hoja de vida", pages: 1 };
  if (/scan|borros/i.test(file.name)) return { status: "UNREADABLE", detail: "Escaneo sin texto legible, pide el original", pages: 1 };
  const jobs = 2 + (file.name.length % 4);
  if (IMAGE.has(kind)) return { status: "READ", detail: `Foto leída con reconocimiento de texto, ${jobs} empleos`, pages: 1 };
  return { status: "READ", detail: `${jobs} empleos y ${1 + (file.name.length % 3)} certificaciones leídos`, pages: 1 + (file.name.length % 3) };
}

/**
 * Estado de la ingesta en el navegador. Simula la subida (progreso), la lectura
 * y el resultado de cada archivo con tiempos realistas. Con backend, `add`
 * subiría a /resumes y el estado llegaría por polling o tiempo real.
 */
export function useIngest(initial: IngestFile[]) {
  const [files, setFiles] = useState(initial);
  const timers = useRef<number[]>([]);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    const list = timers.current;
    // Lo que el servidor entregó "leyendo" termina a los pocos segundos.
    filesRef.current
      .filter((f) => f.status === "PROCESSING")
      .forEach((f, i) => list.push(window.setTimeout(() => setFiles((all) => all.map((x) => (x.id === f.id ? { ...x, ...verdict(x, all) } : x))), 2600 + i * 900)));
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const patch = useCallback((id: string, data: Partial<IngestFile>) => {
    setFiles((list) => list.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, []);

  /** Lee un archivo ya subido: "Leyendo" y luego su resultado. */
  const read = useCallback(
    (id: string, ms = 1400) => {
      patch(id, { status: "PROCESSING", detail: "Leyendo", progress: undefined });
      later(ms, () => {
        const file = filesRef.current.find((f) => f.id === id);
        if (file) patch(id, verdict(file, filesRef.current));
      });
    },
    [later, patch],
  );

  const add = useCallback(
    (incoming: IncomingFile[], source: IngestSource = "upload") => {
      const stamp = Date.now();
      const fresh: IngestFile[] = incoming.map((f, i) => ({
        id: `new-${stamp}-${i}`,
        name: f.name,
        kind: kindOf(f.name),
        sizeKb: Math.max(1, Math.round(f.sizeKb)),
        pages: 0,
        status: "UPLOADING" as IngestStatus,
        detail: "Subiendo",
        source,
        progress: 0,
      }));
      setFiles((list) => [...fresh, ...list]);

      fresh.forEach((f, i) => {
        const steps = 5 + ((i * 3) % 4);
        const start = 120 + i * 260;
        for (let s = 1; s <= steps; s++) later(start + s * 180, () => patch(f.id, { progress: Math.round((s / steps) * 100) }));
        later(start + steps * 180 + 200, () => read(f.id, 1100 + ((i * 370) % 1200)));
      });
      return fresh.length;
    },
    [later, patch, read],
  );

  /** Quita un archivo y devuelve cómo deshacerlo (para el toast). */
  const remove = useCallback((id: string) => {
    const index = filesRef.current.findIndex((f) => f.id === id);
    if (index < 0) return () => undefined;
    const file = filesRef.current[index];
    setFiles((list) => list.filter((f) => f.id !== id));
    return () => setFiles((list) => [...list.slice(0, index), file, ...list.slice(index)]);
  }, []);

  /** Quita varios archivos a la vez (p. ej. todas las duplicadas) y devuelve cómo deshacerlo. */
  const removeMany = useCallback((ids: string[]) => {
    const before = filesRef.current;
    setFiles((list) => list.filter((f) => !ids.includes(f.id)));
    return () => setFiles(before);
  }, []);

  /** "Pedir original": el archivo pasa a esperar una versión nueva. */
  const requestOriginal = useCallback((id: string) => patch(id, { detail: "Pedimos el original al candidato por correo" }), [patch]);

  return { files, add, read, remove, removeMany, requestOriginal };
}
