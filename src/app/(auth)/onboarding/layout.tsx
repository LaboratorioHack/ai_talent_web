import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { OnboardingSteps } from "@/features/onboarding/components/onboarding-steps";

/** Barra del onboarding: marca, pasos y salida suave. */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-[60px] items-center justify-between px-12">
        <Link href={routes.home} aria-label="Inicio">
          <Logo />
        </Link>
        <OnboardingSteps />
        <Link href={routes.home} className="text-sm text-ink-2 transition-colors hover:text-ink">
          Guardar y salir
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
