"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { signInWithPassword, signInWithProvider } from "../api/auth";
import { loginSchema, organizationFromEmail, type LoginInput } from "../schemas/login";
import { ProviderButton } from "./provider-button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [providerLoading, setProviderLoading] = useState<"google" | "azure" | null>(null);
  const next = params.get("next") ?? routes.home;

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
    router.push(next);
    router.refresh();
  }

  async function onProvider(provider: "google" | "azure") {
    setProviderLoading(provider);
    const result = await signInWithProvider(provider, next);
    if (!result.ok) {
      toast({ tone: "error", title: result.message });
      setProviderLoading(null);
    }
  }

  return (
    <div className="stagger flex flex-col gap-7 [&>*]:animate-rise">
      <div className="flex flex-col gap-2" style={{ "--i": 0 } as React.CSSProperties}>
        <h1 className="font-head text-[32px] leading-tight font-semibold">Crea tu cuenta o entra</h1>
        <p className="text-base text-ink-2">Paso 1 de 4. Con tu correo de empresa detectamos la organización.</p>
      </div>

      <div className="flex flex-col gap-2.5" style={{ "--i": 1 } as React.CSSProperties}>
        <ProviderButton provider="google" loading={providerLoading === "google"} disabled={providerLoading !== null} onClick={() => onProvider("google")} />
        <ProviderButton provider="azure" loading={providerLoading === "azure"} disabled={providerLoading !== null} onClick={() => onProvider("azure")} />
      </div>

      <div className="flex items-center gap-3" style={{ "--i": 2 } as React.CSSProperties} aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-3">o con correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6" style={{ "--i": 3 } as React.CSSProperties}>
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
        <Button type="submit" block loading={form.formState.isSubmitting} iconRight={<ArrowRight />}>
          Entrar
        </Button>
      </form>

      <p className="text-sm text-ink-2" style={{ "--i": 4 } as React.CSSProperties}>
        ¿Tu empresa no usa Criba todavía?{" "}
        <a href="mailto:hola@criba.app?subject=Demo" className="inline-flex items-center gap-1 text-ink underline-offset-4 transition-colors hover:underline">
          Pedir una demo
          <ArrowRight aria-hidden className="size-3.5" />
        </a>
      </p>
    </div>
  );
}
