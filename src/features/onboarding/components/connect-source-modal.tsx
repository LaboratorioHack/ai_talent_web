"use client";

import { useState } from "react";
import { ExternalLink, KeyRound } from "lucide-react";
import { Button, Modal, TextField } from "@/shared/components/ui";
import { delay } from "@/shared/mocks";
import type { SourceDef } from "../sources";
import { SourceLogo } from "./source-logo";

export interface ConnectSourceModalProps {
  source: SourceDef | null;
  onConnected: (id: string) => void;
  onLater: (id: string) => void;
  onClose: () => void;
}

/**
 * Conectar una fuente: con clave de API (Greenhouse) o autorizando la cuenta
 * (OAuth). Mientras no exista el backend, la conexión se simula.
 */
export function ConnectSourceModal({ source, onConnected, onLater, onClose }: ConnectSourceModalProps) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (!source) return <Modal open={false} onClose={onClose} title="" />;

  async function connect() {
    if (!source) return;
    if (source.connect === "api-key" && key.trim().length < 12) {
      setError("La clave parece incompleta");
      return;
    }
    setBusy(true);
    await delay(null, 900);
    setBusy(false);
    setKey("");
    setError(undefined);
    onConnected(source.id);
  }

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!busy}
      title={`Conectar ${source.name}`}
      description={
        source.connect === "api-key"
          ? "Pega la clave de API de Greenhouse con permisos de lectura de postulantes. Puedes cambiarla después en Integraciones."
          : `Te llevaremos a ${source.provider} para que autorices el acceso. Criba solo lee hojas de vida; no publica nada en tu nombre.`
      }
      footer={
        <>
          <Button variant="text" disabled={busy} onClick={() => onLater(source.id)}>
            Conectar más tarde
          </Button>
          <Button loading={busy} onClick={connect} icon={source.connect === "api-key" ? <KeyRound /> : <ExternalLink />}>
            {source.connect === "api-key" ? "Conectar" : `Autorizar con ${source.provider}`}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-bg/50 p-3">
        <SourceLogo source={source} size={36} />
        <div className="flex flex-col">
          <span className="text-[13.5px] font-medium">{source.name}</span>
          <span className="text-xs text-ink-3">{source.detail}</span>
        </div>
      </div>
      {source.connect === "api-key" ? (
        <TextField
          label="Clave de API"
          type="password"
          autoComplete="off"
          placeholder="Pega aquí la clave"
          value={key}
          error={error}
          help="Se guarda cifrada en la API de Criba, nunca en el navegador"
          onChange={(e) => {
            setKey(e.target.value);
            setError(undefined);
          }}
        />
      ) : null}
    </Modal>
  );
}
