import type { Metadata } from "next";
import { DoneStep } from "@/features/onboarding/components/done-step";

export const metadata: Metadata = { title: "Todo listo" };

/** Fin del onboarding. */
export default function OnboardingDonePage() {
  return <DoneStep />;
}
