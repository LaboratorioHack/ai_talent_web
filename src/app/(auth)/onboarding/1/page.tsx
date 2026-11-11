import { redirect } from "next/navigation";
import { routes } from "@/shared/constants/routes";

/** El paso 1 (la cuenta) es el login; esta ruta solo evita un 404 al volver atrás. */
export default function OnboardingAccountPage() {
  redirect(routes.login);
}
