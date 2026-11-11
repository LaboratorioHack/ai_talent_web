import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Escribe un correo válido" }).trim().toLowerCase(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Dominios de correo personal: con ellos no detectamos organización. */
const PERSONAL_DOMAINS = new Set(["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"]);

/** "ana@bancolombia.com" → "Bancolombia"; null si es un correo personal. */
export function organizationFromEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || PERSONAL_DOMAINS.has(domain)) return null;
  const name = domain.split(".")[0];
  return name ? name[0].toUpperCase() + name.slice(1) : null;
}
