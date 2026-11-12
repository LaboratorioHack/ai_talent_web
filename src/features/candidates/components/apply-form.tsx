"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Send, Upload, X } from "lucide-react";
import { Button, Collapse, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { submitApplication } from "../api/submit";
import { applicationSchema, type ApplicationInput } from "../schemas/application";

const size = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Formulario de postulación: nombre, correo, hoja de vida y autorización de datos. */
export function ApplyForm({ jobId, company }: { jobId: string; company: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "" },
  });
  const errors = form.formState.errors;

  async function onSubmit(values: ApplicationInput) {
    const result = await submitApplication(jobId, values);
    if (!result.ok) {
      toast({ tone: "error", title: result.message });
      return;
    }
    router.push(routes.applied(jobId));
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="card flex flex-col gap-5 p-5 animate-rise [animation-delay:120ms] sm:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="font-head text-[22px] font-semibold tracking-[-0.01em]">Postúlate</h2>
        <p className="text-[13.5px] text-ink-2">Toma un par de minutos. No necesitas crear una cuenta.</p>
      </div>

      <TextField label="Nombre completo" autoComplete="name" error={errors.name?.message} {...form.register("name")} />
      <TextField label="Correo" type="email" autoComplete="email" placeholder="tu@correo.com" help="Aquí te escribimos si avanzas" error={errors.email?.message} {...form.register("email")} />

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
                  <span className="text-xs text-ink-3">PDF o Word, hasta 10 MB, con el formato que tengas</span>
                </button>
              )}
              <input
                ref={input}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,application/pdf"
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
