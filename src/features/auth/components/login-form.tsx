"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Inbox } from "lucide-react";
import { Button, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { safeNextPath } from "@/shared/lib/auth-redirect";
import { requestPasswordReset, signInWithPassword } from "../api/auth";
import { hasFinishedOnboarding } from "@/features/onboarding/state/onboarding-store";
import { loginSchema, organizationFromEmail, type LoginInput } from "../schemas/login";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  // Solo rutas internas: ?next=//otro-sitio no debe sacar a nadie de Criba.
  const requested = safeNextPath(params.get("next"));
  const linkFailed = params.get("error") === "auth";

  // /auth/callback manda aquí con ?error=auth si el enlace de cambio de contraseña ya no sirve.
  useEffect(() => {
    if (linkFailed) toast({ tone: "error", title: "El enlace ya no sirve", description: "Venció, ya se usó o se abrió en otro navegador. Pide uno nuevo con «¿Olvidaste tu contraseña?»." });
  }, [linkFailed, toast]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const email = useWatch({ control: form.control, name: "email" });
  const org = email.includes("@") ? organizationFromEmail(email) : null;
  const emailValidated = !form.formState.errors.email && Boolean(org);

  async function onSubmit(values: LoginInput) {
    const result = await signInWithPassword(values);
    if (!result.ok) {
      form.setError("password", { message: result.message });
      return;
    }
    toast({ title: "Bienvenida de vuelta", description: org ? `Entrando a ${org}` : undefined, duration: 2500 });
    // Una cuenta nueva sigue con el onboarding; una que ya lo terminó va a donde iba o al panel.
    router.push(hasFinishedOnboarding() ? (requested ?? routes.home) : routes.onboarding(2));
    router.refresh();
  }

  async function onForgot() {
    const ok = await form.trigger("email");
    if (!ok) {
      form.setFocus("email");
      return;
    }
    setResetting(true);
    const result = await requestPasswordReset(form.getValues("email"));
    setResetting(false);
    if (!result.ok) toast({ tone: "error", title: result.message });
    else toast({ title: "Revisa tu correo", description: "Si la cuenta existe, te llega un enlace para crear una contraseña nueva." });
  }

  return (
    <div className="stagger flex flex-col gap-7 short:gap-5 shorter:gap-4 [&>*]:animate-rise">
      <div className="flex flex-col gap-2" style={{ "--i": 0 } as React.CSSProperties}>
        <h1 className="font-head text-[32px] leading-tight short:text-[28px] shorter:text-[26px] font-semibold">Entra a Criba</h1>
        <p className="text-base text-ink-2">Con el correo de empresa que te dio tu organización. Las cuentas se crean por invitación.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 short:gap-4 shorter:gap-3" style={{ "--i": 1 } as React.CSSProperties}>
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
        <TextField
          label="Contraseña"
          help="Mínimo 8 caracteres"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="text-ink-3 transition-colors hover:text-ink"
            >
              {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            </button>
          }
          {...form.register("password")}
        />
        <button type="button" onClick={onForgot} disabled={resetting} className="-mt-3 self-end text-[13px] text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-60 short:-mt-2">
          {resetting ? "Enviando enlace" : "¿Olvidaste tu contraseña?"}
        </button>
        <Button type="submit" block loading={form.formState.isSubmitting} iconRight={<ArrowRight />}>
          Entrar
        </Button>
      </form>

      <div className="flex flex-col gap-4" style={{ "--i": 2 } as React.CSSProperties}>
        <p className="text-sm text-ink-2">
          ¿Tu empresa no usa Criba todavía?{" "}
          <a href="mailto:hola@criba.app?subject=Demo" className="inline-flex items-center gap-1 text-ink underline-offset-4 transition-colors hover:underline">
            Pedir una demo
            <ArrowRight aria-hidden className="size-3.5" />
          </a>
        </p>
        <a
          href={routes.portalSignIn}
          className="group flex items-center gap-4 rounded-2xl bg-amber/10 px-4 py-3.5 ring-1 ring-amber/30 transition-[background-color,box-shadow] duration-300 hover:bg-amber/15 hover:ring-amber/50"
        >
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber text-[#1a211d]">
            <Inbox className="size-5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[14.5px] font-semibold text-ink">¿Buscas empleo?</span>
            <span className="text-[13px] text-ink-2">Entra al portal de postulantes con tu correo, sin contraseña.</span>
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-2 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}
