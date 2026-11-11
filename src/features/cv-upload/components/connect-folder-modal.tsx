"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button, Modal, SelectField, TextField } from "@/shared/components/ui";
import { delay } from "@/shared/mocks";

export interface ConnectFolderModalProps {
  open: boolean;
  onClose: () => void;
  /** Recibe los archivos "encontrados" en la carpeta (simulado). */
  onConnected: (files: { name: string; sizeKb: number }[], provider: string) => void;
}

const PROVIDERS = [
  { value: "drive", label: "Google Drive" },
  { value: "onedrive", label: "OneDrive o SharePoint" },
  { value: "dropbox", label: "Dropbox" },
];

const FOUND = ["santiago_rojas.pdf", "valentina_cruz_cv.docx", "hoja_de_vida_tomas_h.pdf", "isabela_duarte.jpg", "mateo_salazar_2026.pdf", "lucia_cardenas.pdf"];

/** Conectar una carpeta compartida: Criba la revisa y trae las hojas de vida nuevas. */
export function ConnectFolderModal({ open, onClose, onConnected }: ConnectFolderModalProps) {
  const [provider, setProvider] = useState("drive");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function connect() {
    if (!/^https?:\/\/\S+\.\S+/.test(url.trim())) {
      setError("Pega el enlace completo de la carpeta");
      return;
    }
    setBusy(true);
    await delay(null, 1100);
    setBusy(false);
    setUrl("");
    onConnected(
      FOUND.map((name, i) => ({ name, sizeKb: 120 + i * 47 })),
      PROVIDERS.find((p) => p.value === provider)?.label ?? "la carpeta",
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Conectar carpeta compartida"
      description="Criba revisa la carpeta cada hora y trae las hojas de vida nuevas a esta vacante. Solo lee; nunca borra ni mueve archivos."
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button icon={<Link2 />} loading={busy} onClick={connect}>
            Conectar carpeta
          </Button>
        </>
      }
    >
      <SelectField label="Dónde está la carpeta" options={PROVIDERS} value={provider} onChange={setProvider} />
      <TextField
        label="Enlace de la carpeta"
        placeholder="https://drive.google.com/drive/folders/..."
        value={url}
        error={error}
        help="La carpeta debe estar compartida con lectura para tu organización"
        onChange={(e) => {
          setUrl(e.target.value);
          setError(undefined);
        }}
      />
    </Modal>
  );
}
