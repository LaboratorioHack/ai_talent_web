import type { Metadata } from "next";
import { Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { Logo, ProgressSegments } from "@/shared/components/ui";
import { EvidencePanel } from "@/features/auth/components/evidence-panel";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar" };

/** Pantalla 01 · Login · Paso 1 Cuenta. */
export default function LoginPage() {
  return (
    <main className="flex flex-1">
      <section className="flex w-full flex-col justify-between gap-6 bg-surface px-[72px] py-9 lg:w-[600px]">
        <div className="flex flex-col gap-7">
          <Logo />
          <div className="flex flex-col gap-2">
            <ProgressSegments total={4} current={0} />
            <p className="eyebrow">Paso 1 de 4 · Cuenta</p>
          </div>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <footer className="flex items-center justify-between text-xs text-ink-3">
          <span>Privacidad · Términos</span>
          <span className="inline-flex items-center gap-1">
            Español
            <ChevronDown aria-hidden className="size-3" />
          </span>
        </footer>
      </section>
      <EvidencePanel />
    </main>
  );
}
