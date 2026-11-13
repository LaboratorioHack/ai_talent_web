import { z } from "zod";

// La API solo acepta PDF y DOCX: el .doc antiguo se rechaza.
const ACCEPTED = /\.(pdf|docx)$/i;
const MAX_MB = 10;

/**
 * Postulación: solo la hoja de vida y el consentimiento (Habeas Data). El correo y el nombre salen
 * de la cuenta; `name` solo se pide cuando la cuenta todavía no tiene uno (entró con enlace al correo).
 */
export const applicationSchema = z.object({
  name: z.string().trim().max(120, "Máximo 120 caracteres").optional(),
  resume: z
    .custom<File>((v) => typeof File !== "undefined" && v instanceof File, "Adjunta tu hoja de vida")
    .refine((f) => ACCEPTED.test(f.name), "Sube un PDF o un documento de Word (.docx)")
    .refine((f) => f.size <= MAX_MB * 1024 * 1024, `El archivo pesa más de ${MAX_MB} MB`),
  consent: z.literal(true, { message: "Necesitamos tu autorización para tratar tus datos" }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
