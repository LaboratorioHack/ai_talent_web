"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox } from "lucide-react";
import { routes } from "@/shared/constants/routes";

/** "Mis postulaciones" en la barra pública; no aparece en la propia entrada al portal. */
export function MyApplicationsLink() {
  if (usePathname() === routes.portalSignIn) return null;
  return (
    <Link href={routes.portal} className="group inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-[14px] font-medium ring-1 ring-border transition-[box-shadow,transform,translate] duration-300 hover:-translate-y-px hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)]">
      <Inbox aria-hidden className="size-4 text-amber transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6" />
      Mis postulaciones
    </Link>
  );
}
