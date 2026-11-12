import type { PublicJob } from "../types/public";

/**
 * Vacantes de otras empresas (ficticias) que también usan Criba. Un
 * postulante ve todas las convocatorias abiertas, no solo las de una empresa.
 * Se sirven igual que las de la organización de demo.
 */
export const OTHER_COMPANY_JOBS: PublicJob[] = [
  {
    id: "x-devops",
    title: "Ingeniero DevOps",
    company: "Pagos Cóndor",
    companySector: "Pagos digitales",
    companySize: "201 a 1.000 personas",
    area: "Tecnología",
    openings: 2,
    closesAt: "2026-12-04",
    postedAt: "2026-11-06",
    location: "Bogotá",
    modality: "Remoto",
    contract: "Término indefinido",
    schedule: "Tiempo completo",
    salary: null,
    description: "Mantendrás la plataforma de pagos disponible y automatizada: pipelines, Kubernetes en producción e infraestructura como código en la nube.",
    mandatory: [
      { text: "Kubernetes en producción", category: "Plataforma", alsoCounts: ["OpenShift"] },
      { text: "Terraform", category: "IaC", alsoCounts: ["Pulumi"] },
      { text: "AWS o Azure", category: "Cloud", alsoCounts: ["GCP"] },
      { text: "Inglés B1+", category: "Idiomas", alsoCounts: [] },
    ],
    desirable: [
      { text: "GitHub Actions", category: "Herramientas", alsoCounts: [] },
      { text: "Grafana", category: "Herramientas", alsoCounts: [] },
    ],
  },
  {
    id: "x-architect",
    title: "Arquitecto de Soluciones Cloud",
    company: "Seguros Ceiba",
    companySector: "Seguros",
    companySize: "1.001 a 5.000 personas",
    area: "Tecnología",
    openings: 1,
    closesAt: "2026-12-10",
    postedAt: "2026-11-08",
    location: "Medellín",
    modality: "Híbrido",
    contract: "Término indefinido",
    schedule: "Tiempo completo",
    salary: null,
    description: "Diseñarás la arquitectura de los productos digitales sobre Azure y acompañarás a los equipos en su paso a la nube.",
    mandatory: [
      { text: "Azure, 5 años o más", category: "Cloud", alsoCounts: ["AWS"] },
      { text: "Azure DevOps", category: "Herramientas", alsoCounts: ["GitHub Actions"] },
      { text: "Inglés B2+", category: "Idiomas", alsoCounts: [] },
    ],
    desirable: [{ text: "Cert. Azure Architect", category: "Certificaciones", alsoCounts: ["AWS SA"] }],
  },
  {
    id: "x-sre",
    title: "SRE · Confiabilidad",
    company: "Andes Logística",
    companySector: "Logística",
    companySize: "51 a 200 personas",
    area: "Tecnología",
    openings: 1,
    closesAt: "2026-11-29",
    postedAt: "2026-11-02",
    location: "Cali",
    modality: "Remoto",
    contract: "Término fijo, 1 año",
    schedule: "Tiempo completo",
    salary: null,
    description: "Cuidarás que la plataforma de rastreo no se caiga: monitoreo, alertas, guardias y automatización.",
    mandatory: [
      { text: "Monitoreo con Grafana o Datadog", category: "Herramientas", alsoCounts: ["Datadog"] },
      { text: "Kubernetes", category: "Plataforma", alsoCounts: [] },
    ],
    desirable: [{ text: "Python", category: "Lenguajes", alsoCounts: [] }],
  },
];
