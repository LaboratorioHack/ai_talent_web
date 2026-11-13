"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, FileText, Send, Upload, UserRound, X } from "lucide-react";
import { Button, ButtonLink, Collapse, Skeleton, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { accountTypeOf } from "@/shared/lib/account-type";
import { cn } from "@/shared/lib/cn";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import { submitApplication } from "../api/submit";
import { applicationSchema, type ApplicationInput } from "../schemas/application";

const size = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Quién está viendo la vacante: sin sesión, una cuenta de empresa o el postulante que se va a postular. */
type Account = { status: "loading" } | { status: "none" } | { status: "company" } | { status: "applicant"; name: string; email: string };

const CARD = "card flex flex-col gap-5 p-5 animate-rise [animation-delay:120ms] sm:p-7";

/**
 * Postulación: el nombre y el correo salen de la cuenta del postulante, así que solo sube su hoja
 * de vida y autoriza el tratamiento de datos. Sin sesión, invita a entrar y vuelve a esta vacante.
 * Una cuenta de empresa no se postula.
 */
export function ApplyForm({ jobId, company }: { jobId: string; company: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [account, setAccount] = useState<Account>({ status: "loading" });
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    let cancelled = false;
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (cancelled) return;
        if (!user?.email) return setAccount({ status: "none" });
        if (accountTypeOf(user) === "company") return setAccount({ status: "company" });
        const meta = user.user_metadata ?? {};
        const name = [meta.name, meta.full_name].find((value): value is string => typeof value === "string" && value.trim().length > 0);
        setAccount({ status: "applicant", name: name?.trim() ?? "", email: user.email });
      })
      .catch(() => !cancelled && setAccount({ status: "none" }));
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: ApplicationInput) {
    if (account.status !== "applicant") return;
    // La cuenta que entró con enlace al correo no trae nombre: se pide una sola vez y queda guardado.
    const typedName = account.name ? undefined : values.name?.trim();
    if (!account.name && (!typedName || typedName.length < 3)) {
      form.setError("name", { message: "Escribe tu nombre completo" });
      return;
    }
    const result = await submitApplication(jobId, { ...values, name: typedName });
    if (!result.ok) {
      toast({ tone: "error", title: result.message });
      return;
    }
    if (typedName) await createSupabaseBrowserClient().auth.updateUser({ data: { name: typedName } }).catch(() => undefined);
    router.push(routes.applied(jobId));
  }

  if (account.status === "loading") {
    return (
      <div className={CARD} aria-busy>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    );
  }

  if (account.status === "none") {
    return (
      <div className={CARD}>
        <div className="flex flex-col gap-1">
          <h2 className="font-head text-[22px] font-semibold tracking-[-0.01em]">Postúlate</h2>
          <p className="text-[13.5px] text-ink-2">Entra con Google, Microsoft o tu correo. Tu nombre y tu correo salen de tu cuenta: después solo subes tu hoja de vida.</p>
        </div>
        <ButtonLink href={`${routes.portalSignIn}?next=${encodeURIComponent(routes.apply(jobId))}`} block iconRight={<ArrowRight />}>
          Entrar para postularme
        </ButtonLink>
        <p className="text-xs text-ink-3">Si es tu primera vez, creamos tu cuenta de postulante al entrar. Con ella sigues en qué va cada postulación.</p>
      </div>
    );
  }

  if (account.status === "company") {
    return (
      <div className={CARD}>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-surface-2 text-ink-2 ring-1 ring-border">
          <Building2 aria-hidden className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-head text-[22px] font-semibold tracking-[-0.01em]">Estás con una cuenta de empresa</h2>
          <p className="text-[13.5px] text-ink-2">Las cuentas de empresa evalúan postulaciones, no se postulan. Para postularte, cierra sesión y entra con otro correo como postulante.</p>
        </div>
        <ButtonLink href={routes.home} variant="outline" block>
          Volver al panel
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className={CARD}>
      <div className="flex flex-col gap-1">
        <h2 className="font-head text-[22px] font-semibold tracking-[-0.01em]">Postúlate</h2>
        <p className="text-[13.5px] text-ink-2">Solo sube tu hoja de vida. Tus datos salen de tu cuenta.</p>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3 ring-1 ring-border">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-2 ring-1 ring-border">
          <UserRound aria-hidden className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-xs text-ink-3">Te postulas como</span>
          <span className="truncate text-[13.5px] font-medium">{account.name || account.email}</span>
          {account.name ? <span className="truncate text-xs text-ink-3">{account.email}</span> : null}
        </span>
      </div>

      {account.name ? null : <TextField label="Nombre completo" autoComplete="name" help="Solo esta vez: lo guardamos en tu cuenta" error={errors.name?.message} {...form.register("name")} />}

      <Controller
        control={form.control}
        name="resume"
        render={({ field, fieldState }) => {
          const file = field.value as File | undefined;
          const pick = (list: FileList | null) => {
            if (list?.[0]) field.onChange(list[0]);
            field.onBlur();
          };
          return (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Hoja de vida</span>
              {file ? (
                <div className={cn("field-box flex items-center gap-3 px-3 py-2.5 animate-[pop-in_320ms_var(--ease-spring)_both]", fieldState.error && "is-invalid")}>
                  <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-[4px] border border-border bg-surface-2">
                    <FileText aria-hidden className="size-4 text-ink-3" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-medium">{file.name}</span>
                    <span className="text-xs text-ink-3">{size(file.size)}</span>
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar archivo"
                    onClick={() => field.onChange(undefined)}
                    className="flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-hover hover:text-danger"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(true);
                  }}
                  onDragLeave={() => setOver(false)}
                  onDrop={(e: DragEvent) => {
                    e.preventDefault();
                    setOver(false);
                    pick(e.dataTransfer.files);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed px-4 py-6 text-center transition-[border-color,background-color] duration-300 ease-[var(--ease-out-soft)]",
                    over ? "border-amber bg-[color-mix(in_oklab,var(--amber)_7%,var(--surface))]" : fieldState.error ? "border-danger" : "border-border-strong hover:border-ink-3",
                  )}
                >
                  <Upload aria-hidden className="size-5 text-ink-3" />
                  <span className="text-[13.5px] font-medium">{over ? "Suéltala aquí" : "Elige o arrastra tu hoja de vida"}</span>
                  <span className="text-xs text-ink-3">PDF o Word (.docx), hasta 10 MB, con el formato que tengas</span>
                </button>
              )}
              <input
                ref={input}
                type="file"
                hidden
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  pick(e.target.files);
                  e.target.value = "";
                }}
              />
              <Collapse open={Boolean(fieldState.error)}>
                <p className="text-xs text-danger">{fieldState.error?.message}</p>
              </Collapse>
            </div>
          );
        }}
      />

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-2">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-[var(--ink)]" {...form.register("consent")} />
          <span>
            Autorizo a {company} a tratar mis datos personales para este proceso de selección, según la Ley 1581 de 2012 (Habeas Data). Puedo pedir que los borren cuando
            quiera.
          </span>
        </label>
        <Collapse open={Boolean(errors.consent)}>
          <p className="pl-7 text-xs text-danger">{errors.consent?.message}</p>
        </Collapse>
      </div>

      <Button type="submit" block loading={form.formState.isSubmitting} iconRight={<Send />}>
        Enviar postulación
      </Button>
    </form>
  );
}
