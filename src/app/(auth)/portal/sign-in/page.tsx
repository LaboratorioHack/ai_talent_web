import type { Metadata } from "next";
import { PortalSignInForm, PortalSignInScene } from "@/features/candidates/components/portal/portal-sign-in";
import { AuthShell } from "@/shared/components/layout";

export const metadata: Metadata = { title: "Portal del postulante" };

/** Entrada del postulante: el mismo marco que la de empresas, con enlace mágico en vez de contraseña. */
export default function PortalSignInPage() {
  return (
    <AuthShell badge="Postulantes" scene={<PortalSignInScene />} note="No necesitas cuenta para postularte; el portal es para seguir tus postulaciones.">
      <PortalSignInForm />
    </AuthShell>
  );
}
