import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignShowcase } from "./showcase";

export const metadata: Metadata = { title: "Componentes", robots: { index: false } };

/**
 * Guía de estilo viva: refleja el frame "Criba · Componentes" de pen.dev.
 * Solo existe en desarrollo; en producción responde 404 y no se enlaza desde la app.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DesignShowcase />;
}
