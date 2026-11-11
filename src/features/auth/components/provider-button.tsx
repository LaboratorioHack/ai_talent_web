"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const providers = {
  google: {
    label: "Continuar con Google",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z" />
        <path fill="#FBBC05" d="M5.3 14.3c-.5-1.5-.5-3.1 0-4.6V6.6H1.3c-1.7 3.4-1.7 7.4 0 10.8l4-3.1z" />
        <path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5z" />
      </svg>
    ),
  },
  azure: {
    label: "Continuar con Microsoft",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
      </svg>
    ),
  },
} as const;

export interface ProviderButtonProps {
  provider: keyof typeof providers;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function ProviderButton({ provider, loading, disabled, onClick }: ProviderButtonProps) {
  const { label, icon } = providers[provider];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-surface text-[13.5px] font-medium text-ink",
        "transition-[border-color,background-color,transform,translate,scale,rotate,box-shadow] duration-300 ease-[var(--ease-out-soft)]",
        "hover:-translate-y-px hover:border-ink-3 hover:shadow-[0_10px_22px_-14px_rgba(21,32,27,0.45)] active:translate-y-0 disabled:opacity-50",
      )}
    >
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}
