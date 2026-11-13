"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, Check, FileText, MailCheck, MessagesSquare, ShieldCheck } from "lucide-react";
import { AuthHeading, AuthSwitch } from "@/shared/components/layout/auth-shell";
import { Button, TextField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { isApplicantPath } from "@/shared/lib/account-type";
import { safeNextPath } from "@/shared/lib/auth-redirect";
import { cn } from "@/shared/lib/cn";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { sendPortalLink } from "../../api/portal-auth";

const STAGES = ["Recibida", "En revisión", "Entrevista", "Decisión"];

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: "Sin contraseña", detail: "Entras con un enlace a tu correo." },
  { icon: FileText, title: "Tu hoja de vida", detail: "La ves como PDF y subes otra versión cuando quieras." },
  { icon: MessagesSquare, title: "Entrevista por chat", detail: "Si te invitan, la respondes aquí, a tu ritmo." },
];
const STEP_MS = 1600;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A dónde vuelve después de entrar: la vacante desde la que llegó (?next=/jobs/…) o el portal. */
function nextPath(): string {
  const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
  return next && isApplicantPath(next) ? next : routes.portal;
}

/**
 * Formulario de la entrada al portal del postulante: solo el correo; Criba manda un enlace
 * mágico (sin contraseña). Va dentro del mismo marco que la entrada de empresas.
 */
export function PortalSignInForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // /auth/callback manda aquí con ?error=link (enlace vencido) u ?error=oauth (Google/Microsoft).
  useEffect(() => {
    const failure = new URLSearchParams(window.location.search).get("error");
    if (failure !== "link" && failure !== "oauth") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee la URL una sola vez al montar
    setError(failure === "oauth" ? "No se completó la entrada con Google o Microsoft. Intenta de nuevo o usa tu correo." : "El enlace ya no sirve: venció, ya se usó o se abrió en otro navegador. Pide uno nuevo.");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Escribe un correo válido");
      return;
    }
    setLoading(true);
    const result = await sendPortalLink(email.trim().toLowerCase(), nextPath());
    setLoading(false);
    if (result === "sent") setSent(true);
    else setError(result);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 animate-rise">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
          <MailCheck aria-hidden className="size-6" />
        </span>
        <AuthHeading eyebrow="Postulantes" title="Revisa tu correo" description={`Te enviamos un enlace a ${email}. Ábrelo en este dispositivo para entrar.`} />
        <Button variant="text" className="self-start" onClick={() => setSent(false)}>
          Usar otro correo
        </Button>
      </div>
    );
  }

  return (
    <div className="stagger flex flex-col gap-7 short:gap-5 shorter:gap-4 [&>*]:animate-rise">
      <AuthHeading eyebrow="Postulantes" title="Postúlate y sigue tu proceso" description="Entra con Google, Microsoft o tu correo, sin contraseña. Con tu cuenta te postulas solo subiendo tu hoja de vida." />
      <OAuthButtons next={nextPath} onError={setError} />
      <form onSubmit={submit} noValidate className="flex flex-col gap-6 short:gap-4 shorter:gap-3" style={{ "--i": 2 } as React.CSSProperties}>
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
        <Button type="submit" block loading={loading} iconRight={<ArrowRight />}>
          Enviarme el enlace
        </Button>
      </form>
      <AuthSwitch href={routes.login} icon={Building2} title="¿Eres de una empresa?" description="Entra al panel de Criba con tu correo de empresa." />
    </div>
  );
}

/**
 * Escena oscura de la entrada del postulante, hermana de la de empresas: una postulación
 * que avanza sola por sus etapas, tal como la verá la persona en su portal.
 */
export function PortalSignInScene() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % (STAGES.length + 2)), STEP_MS);
    return () => window.clearInterval(t);
  }, []);

  const reached = Math.min(step, STAGES.length - 1);

  return (
    <aside aria-hidden className="dark-scope relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-bg px-12 py-10 lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(237,242,238,0.05)_1px,transparent_1.5px)] bg-[length:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute top-[38%] left-1/2 size-[560px] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.13),transparent)]" />

      <div className="relative flex w-[420px] flex-col gap-8 [@media(max-height:900px)]:[zoom:0.88] short:[zoom:0.76] shorter:[zoom:0.66]">
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">Tu postulación</span>
          <span className="font-head text-[30px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">Sabes en qué va, siempre</span>
        </div>

        <ol className="flex flex-col gap-3">
          {STAGES.map((s, i) => {
            const done = i < reached || (step >= STAGES.length && i === reached);
            const now = i === reached && step < STAGES.length;
            return (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-5 py-4 text-ink transition-[background-color,transform,translate,box-shadow,opacity] duration-700 ease-[var(--ease-out-soft)]",
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

        <div className="flex items-center justify-between text-[13px] text-ink-3">
          <span>Te avisamos en cada paso.</span>
          <span className="flex gap-1.5">
            {Array.from({ length: STAGES.length + 2 }, (_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500", i === step ? "w-5 bg-amber" : "w-1.5 bg-border-strong")} />
            ))}
          </span>
        </div>
      </div>

      <div className="relative mt-14 flex flex-col items-center gap-7 [@media(max-height:900px)]:[zoom:0.88] short:[zoom:0.76] shorter:mt-6 shorter:[zoom:0.66]">
        <p className="text-center font-head text-[26px] leading-[1.15] font-semibold tracking-[-0.01em] text-ink">
          Todas tus postulaciones,
          <br />
          en un solo lugar.
        </p>
        <ul className="grid w-[600px] grid-cols-3 gap-6">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="flex flex-col gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-amber ring-1 ring-border">
                <h.icon className="size-4" />
              </span>
              <span className="text-[13px] font-semibold text-ink">{h.title}</span>
              <span className="text-[12px] leading-snug text-ink-3">{h.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
