import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginShowcase } from "@/features/auth/components/login-showcase";
import { AuthShell } from "@/shared/components/layout";

export const metadata: Metadata = { title: "Entrar" };

/** Entrada de empresas: solo el correo y un enlace de un solo uso. Entrar y registrarse son el mismo paso. */
export default function LoginPage() {
  return (
    <AuthShell scene={<LoginShowcase />} note="¿Te invitaron? Entra con tu correo y escribe el código de tu organización en el siguiente paso.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
