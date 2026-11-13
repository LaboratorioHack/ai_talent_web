"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui";

/** Un enlace para compartir, visible y con su botón de copiar (p. ej. el de la entrevista). */
export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }
  return (
    <div className="field-box flex w-full items-center gap-2 py-1.5 pr-1.5 pl-3">
      <span className="min-w-0 flex-1 truncate text-left font-mono text-[12px] text-ink-2">{url}</span>
      <Button size="sm" variant="outline" icon={copied ? <Check /> : <Copy />} onClick={copy}>
        {copied ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}
