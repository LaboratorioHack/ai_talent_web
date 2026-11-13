import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { apiFetch } from "@/shared/lib/api-client";
import { ACCOUNT_TYPE_KEY, accountTypeForPath, accountTypeOf, type AccountType } from "@/shared/lib/account-type";

/**
 * Tipo de la cuenta que acaba de iniciar sesión. Si ya lo tiene, se respeta. Si no, se fija ahora:
 * "company" cuando la persona ya pertenece a una empresa (cuentas anteriores a esta regla), y si no,
 * según por dónde entró (`next`). Devuelve null solo si no hay sesión.
 */
export async function ensureAccountType(supabase: SupabaseClient, next: string): Promise<AccountType | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const existing = accountTypeOf(session.user);
  if (existing) return existing;

  let type = accountTypeForPath(next);
  if (type === "applicant") {
    // Una cuenta de empresa antigua que entra por el portal sigue siendo de empresa.
    const me = await apiFetch<{ company: unknown | null }>("/auth/me", { token: session.access_token }).catch(() => null);
    if (me?.company) type = "company";
  }
  // Si falla, la cuenta queda sin tipo y se vuelve a intentar en el próximo inicio de sesión.
  await supabase.auth.updateUser({ data: { [ACCOUNT_TYPE_KEY]: type } });
  return type;
}
