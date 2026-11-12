import { env } from "@/config/env";
import { ApiError } from "@/shared/lib/api-client";
import { browserApi } from "@/shared/lib/api-browser";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import { delay } from "@/shared/mocks";

/** Tamaños que acepta la API (y la restricción de la base de datos), con su texto para la persona. */
export const COMPANY_SIZES = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "501-1000", label: "501–1.000" },
  { value: "1000+", label: "Más de 1.000" },
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number]["value"];

export const isCompanySize = (value: string): value is CompanySize => COMPANY_SIZES.some((s) => s.value === value);

export const companySizeLabel = (value: string) => COMPANY_SIZES.find((s) => s.value === value)?.label ?? value;

export interface CompanyInput {
  name: string;
  sector: string;
  size: CompanySize;
}

/**
 * Crea la organización y deja a la persona como admin: POST /companies.
 * El nombre de quien la crea sale de la cuenta (provision-user.sh lo guarda en
 * user_metadata.name). Si ya pertenece a una empresa (409), sigue el alta.
 */
export async function createCompany(input: CompanyInput): Promise<void> {
  if (env.useMocks) return delay(undefined, 500);
  const {
    data: { user },
  } = await createSupabaseBrowserClient().auth.getUser();
  const yourName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? "";
  try {
    await browserApi("/companies", { method: "POST", body: JSON.stringify({ companyName: input.name, sector: input.sector, size: input.size, yourName }) });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return;
    throw error;
  }
}
