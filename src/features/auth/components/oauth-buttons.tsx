"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui";
import { signInWithProvider, type OAuthProvider } from "../api/auth";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.86-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l3.99-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

const PROVIDERS: { id: OAuthProvider; label: string; mark: () => React.ReactNode }[] = [
  { id: "google", label: "Google", mark: GoogleMark },
  { id: "azure", label: "Microsoft", mark: MicrosoftMark },
];

export interface OAuthButtonsProps {
  /** Ruta interna a la que vuelve después de entrar. */
  next: string;
  /** Muestra el error si no se pudo abrir el proveedor. */
  onError: (message: string) => void;
}

/** Entrar o registrarse con Google o Microsoft (Supabase Auth), con un separador "o con tu correo". */
export function OAuthButtons({ next, onError }: OAuthButtonsProps) {
  const [pending, setPending] = useState<OAuthProvider | null>(null);

  async function start(provider: OAuthProvider) {
    setPending(provider);
    const error = await signInWithProvider(provider, next);
    // Si todo va bien el navegador ya se fue al proveedor; solo volvemos aquí con un error.
    if (error) {
      setPending(null);
      onError(error);
    }
  }

  return (
    <div className="flex flex-col gap-4" style={{ "--i": 1 } as React.CSSProperties}>
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ id, label, mark: Mark }) => (
          <Button key={id} type="button" variant="outline" block loading={pending === id} disabled={pending !== null} icon={<Mark />} onClick={() => start(id)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[12.5px] text-ink-3">
        <span className="h-px flex-1 bg-border" />o con tu correo
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
