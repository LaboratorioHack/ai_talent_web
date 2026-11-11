import { redirect } from "next/navigation";
import { routes } from "@/shared/constants/routes";

/** La landing pública vive en Astro (ai_talent_landing). Aquí entramos a la app. */
export default function Root() {
  redirect(routes.home);
}
