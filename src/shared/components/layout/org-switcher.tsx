"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Modal, useToast } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { CurrentUser, Membership } from "@/shared/types/domain";

const roleLabel: Record<Membership["role"], string> = {
  ADMIN: "Administradora",
  RECRUITER: "Reclutadora",
  VIEWER: "Solo lectura",
};

/** Chip de organización en la barra; abre el modal "Cambiar de organización". */
export function OrgSwitcher({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(user.company.id);
  const { toast } = useToast();
  const current = user.memberships.find((m) => m.company.id === currentId) ?? user.memberships[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-md bg-surface-2 py-1.5 pr-2 pl-2 text-[12.5px] font-medium text-ink hover:brightness-95"
      >
        <span aria-hidden className="size-2 rounded-full bg-amber" />
        {current.company.name}
        <ChevronDown aria-hidden className="size-3.5 text-ink-2" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Cambiar de organización" size="sm">
        <ul className="flex flex-col">
          {user.memberships.map((m) => {
            const active = m.company.id === current.company.id;
            return (
              <li key={m.company.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentId(m.company.id);
                    setOpen(false);
                    if (!active) toast({ title: `Ahora estás en ${m.company.name}` });
                  }}
                  className={cn("flex w-full items-center gap-3 rounded-md px-2.5 py-3 text-left hover:bg-surface-2", active && "bg-surface-2")}
                >
                  <span aria-hidden className={cn("size-2.5 rounded-full", active ? "bg-amber" : "bg-border")} />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className={cn("text-[13.5px]", active && "font-semibold")}>{m.company.name}</span>
                    <span className="text-xs text-ink-2">{roleLabel[m.role]}</span>
                  </span>
                  {active ? <Check aria-hidden className="size-3.5" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="self-start text-sm text-blue hover:underline" onClick={() => toast({ title: "Crear organización", description: "Disponible después del hackathon." })}>
          + Crear organización
        </button>
      </Modal>
    </>
  );
}
