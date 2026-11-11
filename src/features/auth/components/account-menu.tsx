"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShieldCheck } from "lucide-react";
import { Avatar, Popover } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { CurrentUser } from "@/shared/types/domain";
import { signOut } from "../api/auth";

const ROLE: Record<CurrentUser["role"], string> = { ADMIN: "Administradora", RECRUITER: "Reclutadora" };

/** Avatar de la barra con el menú de la cuenta: datos, accesos y cerrar sesión. */
export function AccountMenu({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await signOut();
    router.push(routes.login);
  }

  const item = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink";

  return (
    <Popover
      label={`Cuenta de ${user.name}`}
      width={280}
      triggerClassName="flex size-11 items-center justify-center rounded-full transition-[box-shadow] duration-300 hover:shadow-[0_0_0_3px_var(--surface-3)]"
      trigger={<Avatar name={user.name} size={38} className="bg-amber text-ink" />}
    >
      {(close) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-border px-4 py-4">
            <Avatar name={user.name} size={40} className="bg-amber text-ink" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[14px] font-semibold">{user.name}</span>
              <span className="truncate text-xs text-ink-3">{user.email}</span>
              <span className="text-xs text-ink-2">
                {ROLE[user.role]} en {user.company.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col p-1.5">
            <Link href={routes.integrations} onClick={close} className={item}>
              <Settings aria-hidden className="size-4" />
              Fuentes y permisos
            </Link>
            <Link href={routes.governance} onClick={close} className={item}>
              <ShieldCheck aria-hidden className="size-4" />
              Auditoría de la IA
            </Link>
            <button type="button" onClick={logout} disabled={leaving} className={`${item} text-danger hover:text-danger`}>
              <LogOut aria-hidden className="size-4" />
              {leaving ? "Cerrando sesión" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
