import type { JobOpening, Requirement } from "@/shared/types/domain";

const cloudRequirements: Requirement[] = [
  {
    id: "r-azure",
    roleProfileId: "rp-cloud",
    type: "MANDATORY",
    category: "Cloud",
    description: "Azure (AKS, DevOps)",
    weight: 25,
    equivalences: [
      { label: "GCP", percent: 80 },
      { label: "AWS", percent: 80 },
    ],
  },
  {
    id: "r-k8s",
    roleProfileId: "rp-cloud",
    type: "MANDATORY",
    category: "Plataforma",
    description: "Kubernetes en producción",
    weight: 20,
    equivalences: [{ label: "OpenShift", percent: 90 }],
  },
  {
    id: "r-iac",
    roleProfileId: "rp-cloud",
    type: "MANDATORY",
    category: "IaC",
    description: "Terraform o IaC",
    weight: 15,
    equivalences: [
      { label: "Pulumi", percent: 100 },
      { label: "Bicep", percent: 100 },
    ],
  },
  { id: "r-en", roleProfileId: "rp-cloud", type: "MANDATORY", category: "Idiomas", description: "Inglés B2+", weight: 10, equivalences: [] },
  {
    id: "r-cert",
    roleProfileId: "rp-cloud",
    type: "NICE_TO_HAVE",
    category: "Certificaciones",
    description: "Cert. Azure Architect",
    weight: 15,
    equivalences: [{ label: "AWS SA Pro", percent: 60 }],
  },
  {
    id: "r-fin",
    roleProfileId: "rp-cloud",
    type: "NICE_TO_HAVE",
    category: "Sector",
    description: "Sector financiero",
    weight: 15,
    equivalences: [
      { label: "Banca", percent: 100 },
      { label: "Fintech", percent: 100 },
    ],
  },
  {
    id: "r-comp",
    roleProfileId: "rp-cloud",
    type: "DISQUALIFYING",
    description: "Trabaja hoy en competidor directo",
    weight: null,
    equivalences: [],
  },
];

function vacancy(partial: Omit<JobOpening, "companyId" | "createdAt" | "profile"> & { area: string; requirements?: Requirement[] }): JobOpening {
  const { area, requirements = [], ...rest } = partial;
  return {
    companyId: "c-bd",
    createdAt: "2026-10-20",
    profile: {
      id: `rp-${rest.id}`,
      jobOpeningId: rest.id,
      version: 3,
      description: "",
      area,
      requirements,
      autoInterview: true,
    },
    ...rest,
  };
}

export const mockVacancies: JobOpening[] = [
  vacancy({
    id: "v-cloud",
    title: "Ingeniero Cloud Senior",
    status: "OPEN",
    openings: 2,
    closesAt: "2026-11-30",
    area: "Tecnología",
    requirements: cloudRequirements,
    stats: { received: 84, read: 84, meets: 12, partial: 31, doesNotMeet: 41, interview: 4, finalist: 2 },
  }),
  vacancy({
    id: "v-data",
    title: "Analista de Datos",
    status: "OPEN",
    openings: 1,
    closesAt: "2026-11-18",
    area: "Datos",
    stats: { received: 37, read: 34, meets: 4, partial: 12, doesNotMeet: 21, interview: 2, finalist: 0 },
  }),
  vacancy({
    id: "v-backend",
    title: "Desarrollador Backend Jr",
    status: "OPEN",
    openings: 3,
    closesAt: "2026-11-22",
    area: "Tecnología",
    stats: { received: 40, read: 40, meets: 9, partial: 22, doesNotMeet: 9, interview: 3, finalist: 1 },
  }),
  vacancy({
    id: "v-ux",
    title: "Diseñador UX",
    status: "OPEN",
    openings: 1,
    closesAt: "2026-11-28",
    area: "Producto",
    stats: { received: 15, read: 15, meets: 6, partial: 5, doesNotMeet: 4, interview: 2, finalist: 1 },
  }),
  vacancy({
    id: "v-product",
    title: "Líder de Producto",
    status: "OPEN",
    openings: 1,
    closesAt: "2026-12-05",
    area: "Producto",
    stats: { received: 0, read: 0, meets: 0, partial: 0, doesNotMeet: 0, interview: 0, finalist: 0 },
  }),
  vacancy({
    id: "v-sec",
    title: "Especialista en Ciberseguridad",
    status: "OPEN",
    openings: 1,
    closesAt: "2026-12-12",
    area: "Tecnología",
    stats: { received: 21, read: 19, meets: 3, partial: 8, doesNotMeet: 8, interview: 1, finalist: 0 },
  }),
  vacancy({
    id: "v-scrum",
    title: "Scrum Master",
    status: "DRAFT",
    openings: 1,
    closesAt: "2026-12-20",
    area: "Operaciones",
    stats: { received: 0, read: 0, meets: 0, partial: 0, doesNotMeet: 0, interview: 0, finalist: 0 },
  }),
];

export const mockAreas = ["Tecnología", "Datos", "Producto", "Operaciones", "Finanzas", "Talento"];
