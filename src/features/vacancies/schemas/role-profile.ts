import { z } from "zod";

export const requirementTypeSchema = z.enum(["MANDATORY", "NICE_TO_HAVE", "DISQUALIFYING"]);

export const equivalenceSchema = z.object({
  label: z.string().trim().min(1).max(80),
  // Mismos límites que la API: una equivalencia de 0 % no cuenta y se rechaza.
  percent: z.number().int().min(1).max(100),
});

export const requirementDraftSchema = z.object({
  id: z.string(),
  description: z.string().trim().min(2, "Escribe el requisito").max(1000, "Máximo 1.000 caracteres"),
  type: requirementTypeSchema,
  weight: z.number().int().min(0).max(100).nullable(),
  equivalences: z.array(equivalenceSchema),
});

/** Lo que ve el candidato además del perfil. Todo es opcional; vacío no se publica. */
export const listingDraftSchema = z.object({
  location: z.string().trim().max(80, "Máximo 80 caracteres"),
  modality: z.enum(["", "ONSITE", "HYBRID", "REMOTE"]),
  contract: z.string().max(80),
  schedule: z.string().max(80),
  salary: z.string().trim().max(80, "Máximo 80 caracteres"),
});

export const roleProfileDraftSchema = z
  .object({
    title: z.string().trim().min(1, "Ponle nombre a la vacante").max(80, "Máximo 80 caracteres"),
    description: z.string().max(4000, "Máximo 4.000 caracteres"),
    area: z.string().min(1, "Elige un área"),
    closesAt: z.string().min(1, "Elige la fecha de cierre"),
    openings: z.number().int().min(1).max(50),
    autoInterview: z.boolean(),
    ignoreSensitive: z.literal(true),
    requirements: z.array(requirementDraftSchema).min(1, "Añade al menos un requisito"),
    listing: listingDraftSchema,
  })
  .refine((v) => v.requirements.some((r) => r.type === "MANDATORY"), {
    message: "Necesitas al menos un requisito obligatorio",
    path: ["requirements"],
  });

export type RequirementDraft = z.infer<typeof requirementDraftSchema>;
export type RoleProfileDraft = z.infer<typeof roleProfileDraftSchema>;
export type ListingDraft = z.infer<typeof listingDraftSchema>;

export const emptyListing = (): ListingDraft => ({ location: "", modality: "", contract: "", schedule: "", salary: "" });

export const REQUIREMENT_TYPE_LABEL: Record<RequirementDraft["type"], string> = {
  MANDATORY: "Obligatorio",
  NICE_TO_HAVE: "Deseable",
  DISQUALIFYING: "Descalificante",
};

/** Suma de pesos de obligatorios y deseables (los descalificantes no pesan). */
export function weightTotals(requirements: RequirementDraft[]) {
  const mandatory = requirements.filter((r) => r.type === "MANDATORY").reduce((s, r) => s + (r.weight ?? 0), 0);
  const niceToHave = requirements.filter((r) => r.type === "NICE_TO_HAVE").reduce((s, r) => s + (r.weight ?? 0), 0);
  return { mandatory, niceToHave, total: mandatory + niceToHave };
}
