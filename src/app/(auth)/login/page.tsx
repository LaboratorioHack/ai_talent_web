import type { Metadata } from "next";
import { Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { Logo, ProgressSegments } from "@/shared/components/ui";
import { LoginShowcase } from "@/features/auth/components/login-showcase";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar" };

/** Pantalla 01 · Login · Paso 1 Cuenta. */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <section className="flex w-full flex-col justify-between gap-6 px-[72px] py-9 lg:w-[560px] lg:shrink-0 lg:overflow-y-auto short:py-6 shorter:py-4">
        <div className="flex flex-col gap-7 short:gap-4 shorter:gap-3">
          <Logo />
          <div className="flex flex-col gap-2">
            <ProgressSegments total={4} current={0} />
            <p className="eyebrow shorter:hidden">Paso 1 de 4</p>
          </div>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <footer className="flex items-center justify-between text-xs text-ink-3">
          <span className="flex gap-4">
            <span>Privacidad</span>
            <span>Términos</span>
          </span>
          <span className="inline-flex items-center gap-1">
            Español
            <ChevronDown aria-hidden className="size-3" />
          </span>
        </footer>
      </section>
      <LoginShowcase />
    </main>
  );
}
