import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginShowcase } from "@/features/auth/components/login-showcase";
import { AuthShell } from "@/shared/components/layout";

export const metadata: Metadata = { title: "Entrar" };

/** Entrada de empresas: correo y contraseña (sin registro público; las cuentas se crean por invitación). */
export default function LoginPage() {
  return (
    <AuthShell scene={<LoginShowcase />} note="Las cuentas de empresa se crean por invitación de tu organización.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
