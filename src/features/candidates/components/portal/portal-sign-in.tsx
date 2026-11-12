"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck } from "lucide-react";
import { Button, TextField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { sendPortalLink } from "../../api/portal-auth";

/**
 * Entrada al portal del postulante: sin contraseña, con un enlace al correo
 * (Supabase OTP). En modo mock entra directo.
 */
export function PortalSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Escribe un correo válido");
      return;
    }
    setLoading(true);
    const result = await sendPortalLink(email.trim().toLowerCase());
    setLoading(false);
    if (result === "mock") router.push(routes.portal);
    else if (result === "sent") setSent(true);
    else setError(result);
  }

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      {sent ? (
        <div className="card flex flex-col items-center gap-4 p-8 text-center animate-rise">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
            <MailCheck aria-hidden className="size-6" />
          </span>
          <h1 className="font-head text-[24px] font-semibold">Revisa tu correo</h1>
          <p className="text-[14px] text-ink-2">Te enviamos un enlace a {email}. Ábrelo en este dispositivo para entrar a tu portal.</p>
          <Button variant="text" onClick={() => setSent(false)}>
            Usar otro correo
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="stagger flex flex-col gap-6 [&>*]:animate-rise">
          <div className="flex flex-col gap-2" style={{ "--i": 0 } as React.CSSProperties}>
            <p className="eyebrow">Portal del postulante</p>
            <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.02em]">Sigue tus postulaciones</h1>
            <p className="text-[15px] text-ink-2">Entra con el correo con el que te postulaste. Sin contraseña: te mandamos un enlace.</p>
          </div>
          <div className="card flex flex-col gap-5 p-6" style={{ "--i": 1 } as React.CSSProperties}>
            <TextField
              label="Correo"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              error={error}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(undefined);
              }}
            />
            <Button type="submit" block loading={loading} iconRight={<ArrowRight />}>
              Enviarme el enlace
            </Button>
          </div>
          <p className="text-[13px] text-ink-3" style={{ "--i": 2 } as React.CSSProperties}>
            ¿Eres de una empresa?{" "}
            <a href={routes.login} className="text-ink underline-offset-4 hover:underline">
              Entra aquí
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
