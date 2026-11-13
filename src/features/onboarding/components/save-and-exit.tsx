"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { signOut } from "@/features/auth/api/auth";

/**
 * Salir del onboarding sin perder lo hecho: el avance vive en el store y se retoma
 * al volver a entrar. Cierra la sesión y lleva al inicio de sesión; si solo
 * navegara, el proxy vería una cuenta sin organización y la devolvería aquí.
 */
export function SaveAndExit() {
  const router = useRouter();
  const { toast } = useToast();
  const [leaving, setLeaving] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      icon={<LogOut />}
      loading={leaving}
      onClick={async () => {
        setLeaving(true);
        try {
          await signOut();
        } finally {
          toast({ title: "Guardamos tu avance", description: "Inicia sesión cuando quieras y retomas la configuración donde quedaste." });
          router.replace(routes.login);
          router.refresh();
        }
      }}
    >
      Guardar y salir
    </Button>
  );
}
