import type { Integration, IntegrationLogEntry } from "@/shared/types/domain";

export const mockIntegrations: Integration[] = [
  { id: "greenhouse", name: "Greenhouse", kind: "ATS", state: "connected", detail: "18 postulantes hoy", lastSync: "hace 12 min" },
  { id: "linkedin", name: "LinkedIn Recruiter", kind: "MCP", state: "error", detail: "Token vencido · Volver a autorizar", lastSync: "hace 3 h" },
  { id: "lever", name: "Lever", kind: "ATS", state: "disconnected", detail: "Importa candidatos y etapas", lastSync: "—" },
  { id: "drive", name: "Carpeta compartida", kind: "DRIVE", state: "connected", detail: "/RRHH/CVs 2026 · 94 archivos", lastSync: "hace 1 h" },
  { id: "scraping", name: "Scraping de portales", kind: "WEB", state: "paused", detail: "Computrabajo, elempleo · 2 vacantes", lastSync: "ayer" },
  { id: "webhook", name: "Webhook saliente", kind: "API", state: "connected", detail: "Envía rankings a tu ATS", lastSync: "hace 2 min" },
];

export const mockIntegrationLog: IntegrationLogEntry[] = [
  { when: "09:12", source: "Greenhouse", message: "18 postulantes importados", tone: "success" },
  { when: "08:40", source: "Webhook", message: "Ranking enviado · Cloud Senior", tone: "success" },
  { when: "06:05", source: "LinkedIn", message: "401 · token vencido", tone: "danger" },
  { when: "Ayer", source: "Scraping", message: "Pausado por el usuario", tone: "warning" },
  { when: "Ayer", source: "Drive", message: "94 archivos leídos", tone: "success" },
  { when: "Lun", source: "Greenhouse", message: "Conexión creada por Ana", tone: "success" },
];
