import type { CurrentUser, PendingItem } from "@/shared/types/domain";

export const mockUser: CurrentUser = {
  id: "u-ana",
  name: "Ana Martínez",
  email: "ana.m@bancolombia.com",
  role: "ADMIN",
  company: { id: "c-bd", name: "Bancolombia Digital" },
};

export const mockPending: PendingItem[] = [
  { id: "p1", kind: "unreadable", text: "3 hojas de vida ilegibles en Analista de Datos", actionLabel: "Revisar", href: "/candidates?job=v-data" },
  { id: "p2", kind: "duplicate", text: "2 hojas de vida duplicadas en Ingeniero Cloud Senior", actionLabel: "Quitar", href: "/candidates?job=v-cloud" },
  { id: "p3", kind: "contrast", text: "Entrevista de Daniela con 2 contrastes", actionLabel: "Leer", href: "/interviews/i-1" },
];
