"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCribaWork } from "@/shared/lib/criba-work";
import { rejectApplication, requestOriginal as askForOriginal } from "@/shared/lib/application-api";
import type { IngestFile } from "../types/ingest";

/** Cada cuánto se vuelve a pedir la lista mientras Criba AI lee alguna hoja de vida. */
const REFRESH_MS = 5000;

/**
 * Postulaciones de una vacante en el navegador. La lista llega del servidor y se vuelve a pedir
 * mientras haya hojas de vida leyéndose; quitar y pedir el original van a la API.
 */
export function useIngest(jobId: string, initial: IngestFile[]) {
  const router = useRouter();
  const [files, setFiles] = useState(initial);
  const [received, setReceived] = useState(initial);

  // Lo que trae cada recarga del servidor reemplaza la lista (ajuste durante el render, sin efecto).
  if (received !== initial) {
    setReceived(initial);
    setFiles(initial);
  }

  const reading = files.some((f) => f.status === "PROCESSING");
  const inReading = files.filter((f) => f.status === "PROCESSING").length;
  useCribaWork(reading, `Lee ${inReading === 1 ? "una hoja de vida" : `${inReading} hojas de vida`}: texto, anonimización y datos`, "reading");
  useEffect(() => {
    if (!reading) return;
    const t = window.setInterval(() => router.refresh(), REFRESH_MS);
    return () => window.clearInterval(t);
  }, [reading, router]);

  const patch = useCallback((id: string, data: Partial<IngestFile>) => {
    setFiles((list) => list.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, []);

  /** Quita postulaciones de la vacante: quedan descartadas con el motivo en la auditoría. */
  const remove = useCallback(
    async (ids: string[], reason: string): Promise<number> => {
      const results = await Promise.allSettled(ids.map((id) => rejectApplication(jobId, id, reason)));
      const removed = ids.filter((_, i) => results[i].status === "fulfilled");
      setFiles((list) => list.filter((f) => !removed.includes(f.id)));
      return removed.length;
    },
    [jobId],
  );

  /** "Pedir original": la persona recibe un correo para enviarla de nuevo. */
  const requestOriginal = useCallback(
    async (ids: string[]): Promise<number> => {
      const results = await Promise.allSettled(ids.map((id) => askForOriginal(jobId, id)));
      const sent = ids.filter((_, i) => results[i].status === "fulfilled");
      sent.forEach((id) => patch(id, { detail: "Pedimos el original por correo" }));
      return sent.length;
    },
    [jobId, patch],
  );

  return { files, remove, requestOriginal };
}
