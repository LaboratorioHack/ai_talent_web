"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/** Salir del onboarding sin perder lo hecho: el avance vive en el store y se retoma luego. */
export function SaveAndExit() {
  const router = useRouter();
  const { toast } = useToast();
  return (
    <Button
      variant="outline"
      size="sm"
      icon={<LogOut />}
      onClick={() => {
        toast({ title: "Guardamos tu avance", description: "Puedes retomar la configuración cuando quieras." });
        router.push(routes.home);
      }}
    >
      Guardar y salir
    </Button>
  );
}
