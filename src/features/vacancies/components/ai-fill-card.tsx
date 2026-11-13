"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button, Collapse, CribaAi, CribaCharacter, CribaThinking, TextArea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export const MIN_CONTEXT = 20;
export const MAX_CONTEXT = 8000;

export interface AiFillCardProps {
  /** Hay datos escritos que el llenado reemplazaría: se avisa antes. */
  hasContent: boolean;
  busy: boolean;
  thoughts: string[];
  /** Lanza el llenado; resuelve cuando Criba terminó de escribir en el editor. */
  onFill: (context: string) => Promise<boolean>;
}

/**
 * "Llenar con Criba AI": la persona pega la oferta, sus notas o unas líneas sobre el cargo y Criba
 * llena toda la vacante (datos, publicación y requisitos con pesos). Nada se guarda: queda en el
 * editor para revisarlo.
 */
export function AiFillCard({ hasContent, busy, thoughts, onFill }: AiFillCardProps) {
  const [open, setOpen] = useState(!hasContent);
  const [context, setContext] = useState("");
  const [error, setError] = useState<string>();
  const length = context.trim().length;

  async function submit() {
    if (length < MIN_CONTEXT) {
      setError(length ? `Cuéntale un poco más: al menos ${MIN_CONTEXT} caracteres.` : "Pega la oferta o escribe unas líneas sobre el cargo.");
      return;
    }
    setError(undefined);
    if (await onFill(context)) setContext("");
  }

  return (
    <section className="card overflow-hidden animate-rise [animation-delay:40ms]" aria-label="Llenar con Criba AI">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink ring-2 ring-amber/40">
            <CribaCharacter size={24} inverse mood={busy ? "reading" : "idle"} />
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
              Llenar con Criba AI <CribaAi label="Arma la vacante" />
            </h2>
            <p className="text-[13px] text-ink-2">Pega la oferta, tus notas o cuéntale el cargo en unas líneas. Tú revisas todo antes de guardar.</p>
          </div>
        </div>
        {open ? (
          <Button variant="text" size="sm" icon={<X />} onClick={() => setOpen(false)} disabled={busy}>
            Cerrar
          </Button>
        ) : (
          <Button variant="outline" size="sm" icon={<Sparkles />} onClick={() => setOpen(true)}>
            Llenar con IA
          </Button>
        )}
      </div>

      <Collapse open={open}>
        <div className="flex flex-col gap-4 border-t border-border px-5 py-5 sm:px-7">
          <TextArea
            label="Contexto del cargo"
            placeholder="Ej.: Necesitamos 2 desarrolladores backend con Node y AWS para el equipo de pagos, híbrido en Bogotá, contrato indefinido, salario entre 7 y 9 millones. Inglés deseable. Cierra el 30 de noviembre."
            minRows={4}
            maxRows={12}
            maxLength={MAX_CONTEXT}
            value={context}
            disabled={busy}
            onChange={(e) => {
              setContext(e.target.value);
              setError(undefined);
            }}
            error={error}
            kind={`${context.length} / ${MAX_CONTEXT}`}
          />
          <div className={cn("flex flex-wrap items-center gap-3", hasContent ? "justify-between" : "justify-end")}>
            {hasContent ? <p className="text-[12.5px] text-ink-3">Reemplaza los datos y requisitos que ya escribiste. Lo que el texto no diga se queda como está.</p> : null}
            <Button icon={<Sparkles />} loading={busy} onClick={submit}>
              Llenar la vacante
            </Button>
          </div>
          {thoughts.length ? <CribaThinking thoughts={thoughts} working={busy} mood="reading" title="Criba AI está armando la vacante" /> : null}
        </div>
      </Collapse>
    </section>
  );
}
