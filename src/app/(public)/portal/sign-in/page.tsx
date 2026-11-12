import type { Metadata } from "next";
import { PortalSignIn } from "@/features/candidates/components/portal/portal-sign-in";

export const metadata: Metadata = { title: "Portal del postulante" };

/** Entrada al portal del postulante con enlace mágico. */
export default function PortalSignInPage() {
  return <PortalSignIn />;
}
