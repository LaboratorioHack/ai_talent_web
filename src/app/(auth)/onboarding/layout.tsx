import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { OnboardingProgress, OnboardingSteps } from "@/features/onboarding/components/onboarding-steps";
import { SaveAndExit } from "@/features/onboarding/components/save-and-exit";
import { OnboardingProvider } from "@/features/onboarding/state/onboarding-store";

/**
 * Barra del onboarding: marca, pasos (los hechos permiten volver) y una salida
 * que guarda el avance. El progreso fino a lo ancho marca cuánto falta.
 * El estado del alta vive en OnboardingProvider.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingProvider>
      {/* --app-header: alto de la barra fija; los encabezados sticky de las pantallas se pegan debajo. */}
      <div className="flex flex-1 flex-col [--app-header:64px]">
        <header className="sticky top-0 z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center bg-bg/85 px-12 backdrop-blur-md">
          <Link href={routes.home} aria-label="Inicio" className="justify-self-start">
            <Logo />
          </Link>
          <OnboardingSteps />
          <div className="justify-self-end">
            <SaveAndExit />
          </div>
          <OnboardingProgress />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </OnboardingProvider>
  );
}
