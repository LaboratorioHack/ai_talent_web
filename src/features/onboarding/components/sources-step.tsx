"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Button, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { SOURCES, sourceById, type SourceDef } from "../sources";
import { useOnboarding } from "../state/onboarding-store";
import { ConnectSourceModal } from "./connect-source-modal";
import { SourceLogo } from "./source-logo";
import { StepFrame } from "./step-frame";

/** Pantalla 03 · Onboarding · Paso 3 Fuentes. Al continuar, conecta las que lo necesitan. */
export function SourcesStep() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, setSource } = useOnboarding();
  const [connecting, setConnecting] = useState<SourceDef | null>(null);

  const pending = (skip?: string) => SOURCES.filter((s) => s.id !== skip && data.sources[s.id] === "selected" && s.connect !== "none");

  function toggle(id: string) {
    setSource(id, id in data.sources ? null : "selected");
  }

  /** Abre la siguiente fuente por conectar o pasa al paso 4. */
  function next(justHandled?: string) {
    const queue = pending(justHandled);
    if (queue.length > 0) setConnecting(queue[0]);
    else {
      setConnecting(null);
      router.push(routes.onboarding(4));
    }
  }

  return (
    <StepFrame
      step={3}
      title="¿De dónde llegan las hojas de vida?"
      description="Elige una o varias. Las que necesiten permiso te las pedimos al continuar."
      width={780}
      bare
      footer={
        <>
          <Button variant="text" icon={<ArrowLeft />} onClick={() => router.push(routes.onboarding(2))}>
            Atrás
          </Button>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.push(routes.onboarding(4))} className="text-sm text-ink-2 transition-colors hover:text-ink">
              Omitir por ahora
            </button>
            <Button disabled={Object.keys(data.sources).length === 0} onClick={() => next()}>
              Continuar
            </Button>
          </div>
        </>
      }
    >
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 [&>*]:animate-rise" role="group" aria-label="Fuentes">
        {SOURCES.map((source, i) => {
          const state = data.sources[source.id];
          const on = state !== undefined;
          return (
            <button
              key={source.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(source.id)}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "flex items-center gap-3.5 rounded-xl border bg-surface p-4 text-left transition-[border-color,transform,translate,scale,rotate,box-shadow] duration-300 ease-[var(--ease-out-soft)]",
                "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(21,32,27,0.5)]",
                on ? "border-ink" : "border-border",
                i === 0 && "sm:col-span-2",
              )}
            >
              <SourceLogo source={source} className={cn("transition-[filter,opacity] duration-500", !on && "opacity-70 grayscale")} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-md font-medium">{source.name}</span>
                <span className="text-[12.5px] text-ink-2">{source.detail}</span>
              </span>
              {state === "connected" ? <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">Conectada</span> : null}
              {state === "later" ? <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2">Más tarde</span> : null}
              <span
                aria-hidden
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,transform,translate,scale,rotate] duration-300 ease-[var(--ease-spring)]",
                  on ? "scale-100 border-ink bg-ink text-ink-inverse" : "scale-90 border-border-strong",
                )}
              >
                <Check className={cn("size-3 transition-opacity duration-200", on ? "opacity-100" : "opacity-0")} />
              </span>
            </button>
          );
        })}
      </div>

      <ConnectSourceModal
        source={connecting}
        onClose={() => setConnecting(null)}
        onConnected={(id) => {
          setSource(id, "connected");
          toast({ title: `${sourceById(id)?.name} conectada`, description: "Las hojas de vida nuevas llegarán solas a tus vacantes." });
          next(id);
        }}
        onLater={(id) => {
          setSource(id, "later");
          next(id);
        }}
      />
    </StepFrame>
  );
}
