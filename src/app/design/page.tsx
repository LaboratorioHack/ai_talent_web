import type { Metadata } from "next";
import { DesignShowcase } from "./showcase";

export const metadata: Metadata = { title: "Componentes" };

/** Guía de estilo viva: refleja el frame "Criba · Componentes" de pen.dev. */
export default function DesignPage() {
  return <DesignShowcase />;
}
