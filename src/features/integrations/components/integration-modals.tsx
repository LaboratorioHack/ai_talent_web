"use client";

import { useState } from "react";
import { AlertTriangle, Check, KeyRound, Plug, RefreshCw } from "lucide-react";
import { Button, Modal, SelectField, TextField, Toggle } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { delay } from "@/shared/mocks";
import type { Integration } from "@/shared/types/domain";
import { IntegrationLogo } from "./integration-logo";

/** Error de conexión: qué pasó, el código y cómo arreglarlo. */
export function ErrorModal({ item, open, onClose, onFixed, onLog }: { item: Integration | null; open: boolean; onClose: () => void; onFixed: () => void; onLog: () => void }) {
  const [busy, setBusy] = useState(false);
  async function reauthorize() {
    setBusy(true);
    await delay(null, 1300);
    setBusy(false);
    onFixed();
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={item ? `Sin conexión con ${item.name}` : "Sin conexión"}
      description="El token venció el 10 de noviembre. Mientras tanto no se importan postulantes nuevos; lo ya importado sigue disponible."
      footer={
        <>
          <Button variant="text" onClick={onLog} disabled={busy}>
            Ver registro
          </Button>
          <Button icon={<RefreshCw />} loading={busy} onClick={reauthorize}>
            Volver a autorizar
          </Button>
        </>
      }
    >
      <p className="flex items-center gap-2.5 rounded-xl bg-danger-soft px-4 py-3 font-mono text-[12.5px] text-danger">
        <AlertTriangle aria-hidden className="size-4 shrink-0" />
        401 Unauthorized en GET /v2/applicants
      </p>
    </Modal>
  );
}

const FREQUENCIES = [
  { value: "15", label: "Cada 15 minutos" },
  { value: "60", label: "Cada hora" },
  { value: "1440", label: "Una vez al día" },
];

/** Configurar una conexión activa: frecuencia, vacantes y qué se escribe de vuelta. */
export function ConfigureModal({ item, jobs, open, onClose, onSaved }: { item: Integration | null; jobs: { value: string; label: string }[]; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [freq, setFreq] = useState("60");
  const [job, setJob] = useState("all");
  const [writeBack, setWriteBack] = useState(true);
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={item ? `Configurar ${item.name}` : "Configurar"}
      description="Los cambios se aplican desde la próxima sincronización."
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            icon={<Check />}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await delay(null, 700);
              setBusy(false);
              onSaved();
            }}
          >
            Guardar
          </Button>
        </>
      }
    >
      <SelectField label="Sincronizar" options={FREQUENCIES} value={freq} onChange={setFreq} />
      <SelectField label="Vacantes que importa" options={[{ value: "all", label: "Todas las vacantes abiertas" }, ...jobs]} value={job} onChange={setJob} />
      <Toggle checked={writeBack} onChange={setWriteBack} label="Escribir puntaje y estado de vuelta" description="Tu equipo ve el resultado de Criba sin salir de su herramienta" />
    </Modal>
  );
}

/** Conectar con clave de API (Lever, Greenhouse…). */
export function ConnectModal({ item, open, onClose, onConnected }: { item: Integration | null; open: boolean; onClose: () => void; onConnected: () => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  async function connect() {
    if (key.trim().length < 12) {
      setError("La clave parece incompleta");
      return;
    }
    setBusy(true);
    await delay(null, 1100);
    setBusy(false);
    setKey("");
    onConnected();
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={item ? `Conectar ${item.name}` : "Conectar"}
      description="Pega una clave con permisos de lectura de candidatos. Se guarda cifrada en la API de Criba, nunca en el navegador."
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button icon={<KeyRound />} loading={busy} onClick={connect}>
            Conectar
          </Button>
        </>
      }
    >
      <TextField
        label="Clave de API"
        type="password"
        autoComplete="off"
        placeholder="Pega aquí la clave"
        value={key}
        error={error}
        onChange={(e) => {
          setKey(e.target.value);
          setError(undefined);
        }}
      />
    </Modal>
  );
}

export const CATALOG: { id: string; name: string; kind: Integration["kind"]; detail: string; logo?: string }[] = [
  { id: "computrabajo", name: "Computrabajo", kind: "WEB", detail: "Hojas de vida de tus ofertas activas", logo: "/logos/computrabajo.png" },
  { id: "indeed", name: "Indeed", kind: "WEB", detail: "Postulaciones de tus avisos", logo: "/logos/indeed.png" },
  { id: "gmail", name: "Gmail", kind: "DRIVE", detail: "Adjuntos de un correo de selección", logo: "/logos/gmail.png" },
  { id: "workday", name: "Workday", kind: "ATS", detail: "Candidatos y etapas de tu ATS" },
  { id: "onedrive", name: "OneDrive", kind: "DRIVE", detail: "Una carpeta de SharePoint u OneDrive" },
  { id: "api", name: "API de Criba", kind: "API", detail: "Envía hojas de vida desde tus sistemas" },
];

/** Catálogo para añadir una integración nueva. */
export function AddModal({ open, existing, onClose, onAdd }: { open: boolean; existing: string[]; onClose: () => void; onAdd: (id: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <Modal open={open} onClose={onClose} dismissible={!busy} title="Añadir integración" description="Elige de dónde llegan hojas de vida o a dónde enviar los resultados.">
      <ul className="grid grid-cols-2 gap-2">
        {CATALOG.map((c, i) => {
          const added = existing.includes(c.id);
          return (
            <li key={c.id} className="animate-[option-in_300ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                type="button"
                disabled={added || busy !== null}
                onClick={async () => {
                  setBusy(c.id);
                  await delay(null, 900);
                  setBusy(null);
                  onAdd(c.id);
                }}
                className={cn("flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-[border-color,background-color] duration-300 enabled:hover:border-border-strong enabled:hover:bg-surface-2/60 disabled:opacity-60")}
              >
                <IntegrationLogo id={c.id} kind={c.kind} size={36} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13.5px] font-medium">{c.name}</span>
                  <span className="truncate text-[12px] text-ink-3">{added ? "Ya está conectada" : busy === c.id ? "Conectando" : c.detail}</span>
                </span>
                {busy === c.id ? <RefreshCw aria-hidden className="size-4 animate-spin text-ink-3" /> : added ? <Check aria-hidden className="size-4 text-success" /> : <Plug aria-hidden className="size-4 text-ink-3" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] text-ink-3">
        ¿No está la tuya? Usa el webhook o la API de Criba.
      </p>
    </Modal>
  );
}
