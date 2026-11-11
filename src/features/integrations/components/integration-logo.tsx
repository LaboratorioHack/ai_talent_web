import Image from "next/image";
import { Briefcase, Code2, FolderOpen, Globe, Webhook, type LucideIcon } from "lucide-react";
import type { Integration } from "@/shared/types/domain";

const LOGOS: Record<string, string> = {
  greenhouse: "/logos/greenhouse.png",
  linkedin: "/logos/linkedin.png",
  drive: "/logos/gdrive.png",
  computrabajo: "/logos/computrabajo.png",
  indeed: "/logos/indeed.png",
  gmail: "/logos/gmail.png",
};

const KIND_ICON: Record<Integration["kind"], LucideIcon> = { ATS: Briefcase, MCP: Briefcase, DRIVE: FolderOpen, WEB: Globe, API: Code2 };

/** Logo oficial de la integración si existe; si no, un icono según el tipo. */
export function IntegrationLogo({ id, kind, size = 44 }: { id: string; kind: Integration["kind"]; size?: number }) {
  const logo = LOGOS[id];
  const Icon = id === "webhook" ? Webhook : KIND_ICON[kind];
  return (
    <span className="flex shrink-0 items-center justify-center rounded-xl bg-surface shadow-[0_6px_16px_-10px_rgba(21,32,27,0.35)] ring-1 ring-border" style={{ width: size, height: size, padding: size * 0.2 }}>
      {logo ? <Image src={logo} alt="" width={size} height={size} className="size-full object-contain" /> : <Icon aria-hidden className="size-full text-ink-2" strokeWidth={1.6} />}
    </span>
  );
}
