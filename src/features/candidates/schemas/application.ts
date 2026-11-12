import { z } from "zod";

// La API solo acepta PDF y DOCX: el .doc antiguo se rechaza.
const ACCEPTED = /\.(pdf|docx)$/i;
const MAX_MB = 10;

/** Postulación pública: nombre, correo, hoja de vida y consentimiento (Habeas Data). */
export const applicationSchema = z.object({
  name: z.string().trim().min(3, "Escribe tu nombre completo").max(120, "Máximo 120 caracteres"),
  email: z.email({ message: "Escribe un correo válido" }).trim().toLowerCase(),
  resume: z
    .custom<File>((v) => typeof File !== "undefined" && v instanceof File, "Adjunta tu hoja de vida")
    .refine((f) => ACCEPTED.test(f.name), "Sube un PDF o un documento de Word (.docx)")
    .refine((f) => f.size <= MAX_MB * 1024 * 1024, `El archivo pesa más de ${MAX_MB} MB`),
  consent: z.literal(true, { message: "Necesitamos tu autorización para tratar tus datos" }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
