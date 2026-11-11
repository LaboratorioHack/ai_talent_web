import type { CurrentUser, PendingItem } from "@/shared/types/domain";

export const mockUser: CurrentUser = {
  id: "u-ana",
  name: "Ana Martínez",
  email: "ana.m@bancolombia.com",
  role: "ADMIN",
  company: { id: "c-bd", name: "Bancolombia Digital" },
  memberships: [
    { company: { id: "c-bd", name: "Bancolombia Digital" }, role: "ADMIN" },
    { company: { id: "c-nq", name: "Nequi" }, role: "RECRUITER" },
    { company: { id: "c-sf", name: "Sufi" }, role: "VIEWER" },
  ],
};

export const mockPending: PendingItem[] = [
  { id: "p1", kind: "unreadable", text: "3 hojas de vida ilegibles en Analista de Datos", actionLabel: "Revisar", href: "/candidates?job=v-data" },
  { id: "p2", kind: "token", text: "Token de LinkedIn vencido", actionLabel: "Reautorizar", href: "/integrations" },
  { id: "p3", kind: "contrast", text: "Entrevista de Daniela con 2 contrastes", actionLabel: "Leer", href: "/interviews/i-1" },
];
