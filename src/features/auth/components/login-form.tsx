"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Inbox, MailCheck } from "lucide-react";
import { AuthHeading, AuthSwitch } from "@/shared/components/layout/auth-shell";
import { Button, TextField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { safeNextPath } from "@/shared/lib/auth-redirect";
import { sendSignInLink } from "../api/auth";
import { OAuthButtons } from "./oauth-buttons";
import { loginSchema, organizationFromEmail, type LoginInput } from "../schemas/login";

const LINK_FAILED = "El enlace ya no sirve: venció, ya se usó o se abrió en otro navegador. Pide uno nuevo.";
const OAUTH_FAILED = "No se completó la entrada con Google o Microsoft. Intenta de nuevo o usa tu correo.";

/**
 * Entrada de empresas sin contraseña con Supabase Auth: el correo recibe un enlace de un solo uso. Entrar y
 * registrarse son lo mismo; una cuenta nueva sigue al onboarding para crear o unirse a su organización.
 */
export function LoginForm() {
  const params = useSearchParams();
  // Solo rutas internas: ?next=//otro-sitio no debe sacar a nadie de Criba.
  const requested = safeNextPath(params.get("next"));
  const failure = params.get("error");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  // /auth/callback manda aquí con ?error=auth (el enlace del correo ya no sirve) u ?error=oauth (Google/Microsoft).
  useEffect(() => {
    if (failure === "auth") form.setError("email", { message: LINK_FAILED });
    else if (failure === "oauth") form.setError("email", { message: OAUTH_FAILED });
  }, [failure, form]);

  const email = useWatch({ control: form.control, name: "email" });
  const org = email.includes("@") ? organizationFromEmail(email) : null;
  const emailValidated = !form.formState.errors.email && Boolean(org);

  async function onSubmit(values: LoginInput) {
    // El enlace lleva al panel, o a la página del panel que se quería abrir. Sin empresa, al onboarding.
    const result = await sendSignInLink(values.email, requested ?? routes.home);
    if (result === "sent") setSentTo(values.email);
    else form.setError("email", { message: result });
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4 animate-rise">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
          <MailCheck aria-hidden className="size-6" />
        </span>
        <AuthHeading eyebrow="Empresas" title="Revisa tu correo" description={`Te enviamos un enlace a ${sentTo}. Ábrelo en este dispositivo para entrar; vence en una hora.`} />
        <Button variant="text" className="self-start" onClick={() => setSentTo(null)}>
          Usar otro correo
        </Button>
      </div>
    );
  }

  return (
    <div className="stagger flex flex-col gap-7 short:gap-5 shorter:gap-4 [&>*]:animate-rise">
      <AuthHeading eyebrow="Empresas" title="Entra a Criba" description="Con Google, Microsoft o tu correo de empresa, sin contraseña. Si es tu primera vez, creamos tu cuenta." />

      <OAuthButtons next={requested ?? routes.home} onError={(message) => form.setError("email", { message })} />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 short:gap-4 shorter:gap-3" style={{ "--i": 2 } as React.CSSProperties}>
        <TextField
          label="Correo de empresa"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          error={form.formState.errors.email?.message}
          validated={emailValidated}
          help={emailValidated && org ? `Detectamos ${org} por tu correo` : undefined}
          {...form.register("email")}
        />
        <Button type="submit" block loading={form.formState.isSubmitting} iconRight={<ArrowRight />}>
          Enviarme el enlace
        </Button>
      </form>

      <AuthSwitch href={routes.portalSignIn} icon={Inbox} title="¿Buscas empleo?" description="Entra al portal de postulantes con el correo con el que te postulaste." />
    </div>
  );
}
