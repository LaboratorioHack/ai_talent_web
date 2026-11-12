"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Check, MailCheck } from "lucide-react";
import { Button, TextField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { sendPortalLink } from "../../api/portal-auth";

const STAGES = ["Recibida", "En revisión", "Entrevista", "Decisión"];
const STEP_MS = 1600;

/**
 * Entrada al portal del postulante, distinta a la de empresa: formulario sin
 * contraseña (enlace al correo) y un panel ámbar donde una postulación avanza
 * sola por sus etapas.
 */
export function PortalSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % (STAGES.length + 2)), STEP_MS);
    return () => window.clearInterval(t);
  }, []);
  const reached = Math.min(step, STAGES.length - 1);

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
    <div className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-8">
      <div className="flex flex-col gap-8">
        {sent ? (
          <div className="flex flex-col gap-4 animate-rise">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
              <MailCheck aria-hidden className="size-6" />
            </span>
            <h1 className="font-head text-[34px] leading-[1.05] font-semibold tracking-[-0.02em]">Revisa tu correo</h1>
            <p className="text-[15px] text-ink-2">Te enviamos un enlace a {email}. Ábrelo en este dispositivo para entrar.</p>
            <Button variant="text" className="self-start" onClick={() => setSent(false)}>
              Usar otro correo
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="stagger flex flex-col gap-7 [&>*]:animate-rise">
            <div className="flex flex-col gap-4" style={{ "--i": 0 } as React.CSSProperties}>
              <span className="w-fit rounded-md bg-amber px-2 py-0.5 text-[11px] font-bold tracking-[0.08em] text-[#1a211d] uppercase">Portal de postulantes</span>
              <h1 className="font-head text-[40px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[52px]">
                Sigue cada <span className="hl">postulación</span>
              </h1>
              <p className="max-w-[440px] text-[16px] leading-relaxed text-ink-2">Entra con el correo con el que te postulaste. Sin contraseña: te mandamos un enlace y listo.</p>
            </div>
            <div className="flex max-w-[440px] flex-col gap-4" style={{ "--i": 1 } as React.CSSProperties}>
              <TextField
                label="Tu correo"
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
              <Button type="submit" block loading={loading} iconRight={<ArrowRight />} className="h-12">
                Enviarme el enlace
              </Button>
            </div>
            <p className="flex items-center gap-2 text-[13px] text-ink-3" style={{ "--i": 2 } as React.CSSProperties}>
              <Building2 aria-hidden className="size-4" />
              ¿Eres de una empresa?
              <a href={routes.login} className="text-ink underline-offset-4 hover:underline">
                Entra aquí
              </a>
            </p>
          </form>
        )}
      </div>

      <div aria-hidden className="relative hidden h-[600px] overflow-hidden rounded-[32px] bg-surface text-ink ring-1 ring-border shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] lg:block">
        <span className="pointer-events-none absolute -top-40 -right-32 size-[460px] rounded-full bg-[radial-gradient(closest-side,rgb(242_169_59/0.16),transparent)]" />

        <div className="absolute inset-x-10 top-12 flex flex-col gap-2">
          <span className="text-[12.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">Tu postulación</span>
          <span className="font-head text-[30px] leading-[1.05] font-semibold tracking-[-0.02em]">Ingeniero Cloud Senior</span>
          <span className="text-[14px] text-ink-3">Cordillera Financiera · Medellín</span>
        </div>

        <ol className="absolute inset-x-10 top-[200px] flex flex-col gap-3">
          {STAGES.map((s, i) => {
            const done = i < reached || (step >= STAGES.length && i === reached);
            const now = i === reached && step < STAGES.length;
            return (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-5 py-4 transition-[background-color,transform,translate,box-shadow] duration-700 ease-[var(--ease-out-soft)]",
                  now ? "translate-x-3 bg-amber text-[#1a211d] shadow-[0_24px_44px_-22px_rgb(242_169_59/0.7)]" : done ? "bg-surface-2 ring-1 ring-border" : "ring-1 ring-border opacity-50",
                )}
              >
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-500", now ? "bg-[#1a211d] text-amber" : done ? "bg-success-soft text-success" : "ring-2 ring-border-strong")}>
                  {done ? <Check className="size-4" /> : now ? <span className="size-2 rounded-full bg-amber animate-breathe" /> : null}
                </span>
                <span className="flex-1 text-[15px] font-semibold">{s}</span>
                <span className={cn("text-[12.5px]", now ? "opacity-70" : "text-ink-3")}>{done ? "Listo" : now ? "Ahora" : ""}</span>
              </li>
            );
          })}
        </ol>

        <div className="absolute inset-x-10 bottom-10 flex items-center justify-between text-[13px] text-ink-3">
          <span>Te avisamos en cada paso</span>
          <span className="flex gap-1.5">
            {Array.from({ length: STAGES.length + 2 }, (_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500", i === step ? "w-5 bg-amber" : "w-1.5 bg-border-strong")} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
