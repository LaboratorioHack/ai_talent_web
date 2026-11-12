import type { ResumeDoc } from "@/shared/types/resume-doc";

/** Hoja de vida de la postulación a1 (la primera del ranking de Cloud Senior). */
export const mockResumeDocs: Record<string, ResumeDoc> = {
  a1: {
    name: "Daniela Osorio Mejía",
    headline: "Ingeniera de plataforma cloud",
    contact: ["daniela.osorio@correo.com", "+57 300 000 0000", "Medellín, Colombia"],
    pages: 2,
    sections: [
      {
        title: "Perfil",
        lines: [{ kind: "text", text: "Ingeniera de plataforma con 7 años en nube y automatización. Me gusta dejar la infraestructura documentada y repetible." }],
      },
      {
        title: "Experiencia",
        lines: [
          { kind: "role", text: "Ingeniera de plataforma — Banco digital", right: "2022 – 2025", note: { requirement: "Sector financiero", points: 13 } },
          { kind: "bullet", text: "Migré 40 microservicios a AKS y diseñé los pipelines en Azure DevOps.", note: { requirement: "Azure (AKS, DevOps)", points: 25 } },
          { kind: "bullet", text: "Operé clústeres AKS y GKE con 99,95 % de disponibilidad.", note: { requirement: "Kubernetes en producción", points: 20 } },
          { kind: "bullet", text: "Infraestructura como código con Terraform y Bicep en 3 ambientes.", note: { requirement: "Terraform o IaC", points: 15 } },
          { kind: "role", text: "DevOps Engineer — Comercio minorista", right: "2019 – 2022" },
          { kind: "bullet", text: "Automaticé despliegues y monitoreo con Prometheus y Grafana." },
        ],
      },
      {
        title: "Educación",
        lines: [{ kind: "role", text: "Ingeniería de Sistemas — Universidad pública", right: "2018" }],
      },
      {
        title: "Certificaciones",
        lines: [
          { kind: "text", text: "AWS Certified Solutions Architect – Professional (2024)", note: { requirement: "Cert. Azure, equivale 60 %", points: 9, partial: true } },
          { kind: "text", text: "Certified Kubernetes Administrator (2023)" },
        ],
      },
      {
        title: "Idiomas",
        lines: [{ kind: "text", text: "Inglés C1 (IELTS 7.5), español nativo", note: { requirement: "Inglés B2+", points: 10 } }],
      },
    ],
  },
};
