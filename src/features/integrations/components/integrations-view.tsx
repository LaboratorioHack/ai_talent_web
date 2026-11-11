"use client";

import { useState } from "react";
import { AlertCircle, Check, CircleDashed, Pause, Play, Plug, Plus, RefreshCw, Settings2 } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { Button, Segmented, Toggle, useToast } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { Integration, IntegrationLogEntry, IntegrationState } from "@/shared/types/domain";
import type { IntegrationsData } from "../api/integrations";
import { IntegrationLogo } from "./integration-logo";
import { AddModal, CATALOG, ConfigureModal, ConnectModal, ErrorModal } from "./integration-modals";

const STATE: Record<IntegrationState, { label: string; icon: typeof Check; tone: string }> = {
  connected: { label: "Conectado", icon: Check, tone: "text-success" },
  error: { label: "Error", icon: AlertCircle, tone: "text-danger" },
  disconnected: { label: "Sin conectar", icon: CircleDashed, tone: "text-ink-3" },
  paused: { label: "Pausado", icon: Pause, tone: "text-warning" },
};

const KIND: Record<Integration["kind"], string> = { ATS: "Sistema de selección", MCP: "Conexión con IA", DRIVE: "Carpeta", WEB: "Portales de empleo", API: "Salida a tus sistemas" };
const DOT = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" } as const;

const PERMISSIONS = [
  { source: "LinkedIn Recruiter", items: [{ id: "li-read", label: "Leer perfiles que te autorizaron", on: true }, { id: "li-msg", label: "Enviar mensajes en tu nombre", on: false }, { id: "li-photo", label: "Descargar fotos", on: false, locked: true }] },
  { source: "Greenhouse", items: [{ id: "gh-read", label: "Leer postulantes y hojas de vida", on: true }, { id: "gh-write", label: "Escribir puntaje y estado", on: true }, { id: "gh-move", label: "Mover de etapa", on: false }] },
];

const JOBS = [
  { value: "v-cloud", label: "Ingeniero Cloud Senior" },
  { value: "v-data", label: "Analista de Datos" },
  { value: "v-backend", label: "Desarrollador Backend Jr" },
];

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Pantalla 10 · Integraciones: fuentes y destinos, permisos de la IA y registro. */
export function IntegrationsView({ data }: { data: IntegrationsData }) {
  const { toast } = useToast();
  const [items, setItems] = useState(data.integrations);
  const [log, setLog] = useState(data.log);
  const [logFilter, setLogFilter] = useState<"all" | "danger">("all");
  const [perms, setPerms] = useState(() => Object.fromEntries(PERMISSIONS.flatMap((p) => p.items.map((i) => [i.id, i.on]))));
  const [syncing, setSyncing] = useState<string | null>(null);
  const [modal, setModal] = useState<{ kind: "error" | "configure" | "connect" | "add"; id?: string } | null>(null);
  const target = items.find((i) => i.id === modal?.id) ?? null;

  const addLog = (source: string, message: string, tone: IntegrationLogEntry["tone"]) => setLog((l) => [{ when: now(), source, message, tone }, ...l]);
  const patch = (id: string, data: Partial<Integration>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...data } : i)));

  function sync(item: Integration) {
    setSyncing(item.id);
    window.setTimeout(() => {
      setSyncing(null);
      patch(item.id, { lastSync: "hace un momento" });
      const n = 2 + (item.name.length % 5);
      addLog(item.name, `${n} postulantes importados`, "success");
      toast({ title: `${item.name} sincronizado`, description: `${n} postulantes nuevos llegaron a sus vacantes.` });
    }, 1600);
  }

  function action(item: Integration) {
    const busy = syncing === item.id;
    if (item.state === "error")
      return (
        <Button variant="blue" size="sm" icon={<RefreshCw />} onClick={() => setModal({ kind: "error", id: item.id })}>
          Reautorizar
        </Button>
      );
    if (item.state === "disconnected")
      return (
        <Button variant="outline" size="sm" icon={<Plug />} onClick={() => setModal({ kind: "connect", id: item.id })}>
          Conectar
        </Button>
      );
    if (item.state === "paused")
      return (
        <Button
          variant="outline"
          size="sm"
          icon={<Play />}
          onClick={() => {
            patch(item.id, { state: "connected", lastSync: "hace un momento" });
            addLog(item.name, "Reanudado por Ana", "success");
            toast({ title: `${item.name} reanudado`, action: { label: "Deshacer", onClick: () => patch(item.id, { state: "paused" }) } });
          }}
        >
          Reanudar
        </Button>
      );
    return (
      <span className="flex gap-1">
        <Button variant="text" size="sm" icon={<RefreshCw className={cn(busy && "animate-spin")} />} disabled={busy} onClick={() => sync(item)}>
          {busy ? "Sincronizando" : "Sincronizar"}
        </Button>
        <Button variant="text" size="sm" icon={<Settings2 />} onClick={() => setModal({ kind: "configure", id: item.id })}>
          Configurar
        </Button>
      </span>
    );
  }

  const visibleLog = log.filter((l) => logFilter === "all" || l.tone !== "success");

  return (
    <div className="flex flex-1 flex-col">
      <PageTop
        title="Fuentes y destinos"
        description="De dónde llegan las hojas de vida y a dónde vuelven los resultados."
        actions={
          <Button variant="outline" icon={<Plus />} onClick={() => setModal({ kind: "add" })}>
            Añadir integración
          </Button>
        }
      />

      <div className="grid flex-1 grid-cols-[1fr_400px]">
        <div className="flex min-w-0 flex-col gap-10 px-12 pt-8 pb-14">
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {items.map((item, i) => {
              const s = STATE[item.state];
              return (
                <li key={item.id} className="animate-rise" style={{ animationDelay: `${i * 55}ms` }}>
                  <article
                    className={cn(
                      "card flex h-full flex-col gap-4 p-5 transition-[box-shadow,border-color] duration-500",
                      item.state === "error" && "border-danger/50 shadow-[0_0_0_4px_rgba(200,55,45,0.06)]",
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <IntegrationLogo id={item.id} kind={item.kind} />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[15px] font-semibold">{item.name}</span>
                        <span className="text-[12px] text-ink-3">{KIND[item.kind]}</span>
                      </div>
                      <span key={item.state} className={cn("flex items-center gap-1.5 text-[12.5px] font-medium animate-[pop-in_380ms_var(--ease-spring)_both]", s.tone)}>
                        <s.icon aria-hidden className="size-3.5" />
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[13.5px] text-ink-2">{item.detail}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5">
                      <span className="text-[12px] text-ink-3">Sincronizado {item.lastSync === "—" ? "nunca" : item.lastSync}</span>
                      {action(item)}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <section className="flex flex-col gap-5 animate-rise [animation-delay:300ms]">
            <header className="flex items-end justify-between gap-4 border-t border-border pt-8">
              <div className="flex flex-col gap-1">
                <h2 className="font-head text-[21px] font-semibold tracking-[-0.01em]">Qué puede hacer la IA con cada fuente</h2>
                <p className="text-[13.5px] text-ink-2">Permisos de la organización. Lo que esté apagado, Criba no lo hace.</p>
              </div>
            </header>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {PERMISSIONS.map((p) => (
                <div key={p.source} className="card flex flex-col gap-1 px-6 py-5">
                  <h3 className="mb-2 text-[14px] font-semibold">{p.source}</h3>
                  {p.items.map((it) => (
                    <div key={it.id} className="border-t border-border py-3 first:border-0">
                      <Toggle
                        checked={Boolean(perms[it.id])}
                        disabled={"locked" in it && it.locked}
                        label={it.label}
                        description={"locked" in it && it.locked ? "Bloqueado por política: las fotos nunca se usan" : undefined}
                        onChange={(v) => {
                          setPerms((m) => ({ ...m, [it.id]: v }));
                          addLog(p.source.split(" ")[0], `${v ? "Permitió" : "Quitó"}: ${it.label.toLowerCase()}`, "warning");
                          toast({ title: v ? "Permiso activado" : "Permiso desactivado", description: `${p.source}: ${it.label.toLowerCase()}.` });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="sticky top-[calc(var(--app-header,0px)+56px)] flex max-h-[calc(100dvh-var(--app-header,0px)-56px)] flex-col gap-5 self-start overflow-y-auto border-l border-border bg-surface px-8 pt-8 pb-10">
          <header className="flex items-center justify-between gap-3">
            <h2 className="font-head text-[21px] font-semibold">Registro</h2>
            <Segmented aria-label="Qué mostrar" size="sm" value={logFilter} onChange={setLogFilter} items={[{ value: "all", label: "Todo" }, { value: "danger", label: "Avisos" }]} />
          </header>
          <ol className="flex flex-col">
            {visibleLog.map((l, i) => (
              <li key={`${l.when}-${l.source}-${l.message}-${i}`} className="grid grid-cols-[44px_12px_1fr] items-start gap-3 border-b border-border py-3.5 last:border-0 animate-[option-in_380ms_var(--ease-out-soft)_both]">
                <span className="pt-0.5 text-[12px] text-ink-3 tabular-nums">{l.when}</span>
                <span className={cn("mt-1.5 size-2 rounded-full", DOT[l.tone])} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13.5px] font-medium">{l.source}</span>
                  <span className="text-[13px] text-ink-2">{l.message}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <ErrorModal
        item={target}
        open={modal?.kind === "error"}
        onClose={() => setModal(null)}
        onLog={() => {
          setModal(null);
          setLogFilter("danger");
        }}
        onFixed={() => {
          if (!target) return;
          patch(target.id, { state: "connected", detail: "Autorizado de nuevo, importando postulantes", lastSync: "hace un momento" });
          addLog(target.name, "Autorización renovada", "success");
          setModal(null);
          toast({ title: `${target.name} conectado de nuevo`, description: "Los postulantes pendientes se importan en los próximos minutos." });
        }}
      />
      <ConfigureModal
        item={target}
        jobs={JOBS}
        open={modal?.kind === "configure"}
        onClose={() => setModal(null)}
        onSaved={() => {
          if (target) addLog(target.name, "Configuración actualizada por Ana", "success");
          setModal(null);
          toast({ title: "Configuración guardada" });
        }}
      />
      <ConnectModal
        item={target}
        open={modal?.kind === "connect"}
        onClose={() => setModal(null)}
        onConnected={() => {
          if (!target) return;
          patch(target.id, { state: "connected", detail: "Importando candidatos y etapas", lastSync: "hace un momento" });
          addLog(target.name, "Conexión creada por Ana", "success");
          setModal(null);
          toast({ title: `${target.name} conectado`, description: "La primera importación tarda unos minutos." });
        }}
      />
      <AddModal
        open={modal?.kind === "add"}
        existing={items.map((i) => i.id)}
        onClose={() => setModal(null)}
        onAdd={(id) => {
          const c = CATALOG.find((x) => x.id === id);
          if (!c) return;
          setItems((list) => [...list, { id: c.id, name: c.name, kind: c.kind, state: "connected", detail: c.detail, lastSync: "hace un momento" }]);
          addLog(c.name, "Conexión creada por Ana", "success");
          setModal(null);
          toast({ title: `${c.name} añadido`, description: "Ya aparece en tus fuentes." });
        }}
      />
    </div>
  );
}
