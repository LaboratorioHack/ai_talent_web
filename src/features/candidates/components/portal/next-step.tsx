"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useToday } from "@/shared/hooks/use-today";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { PortalApplication } from "../../types/portal";

/**
 * Lo próximo que toca: bloque ámbar con cuenta regresiva y, a la derecha, un
 * chat que se escribe solo en bucle (pregunta, escribiendo, respuesta).
 */
export function NextStep({ application: a }: { application: PortalApplication }) {
  const today = useToday();
  const due = a.interviewDue ? fromISODate(a.interviewDue) : null;
  const days = today && due ? Math.max(0, Math.round((due.getTime() - today.getTime()) / 86_400_000)) : null;
  const left = days === null ? (due ? `Hasta el ${formatLongDate(due)}` : "") : days === 0 ? "Vence hoy" : days === 1 ? "Te queda 1 día" : `Te quedan ${days} días`;

  return (
    <Link
      href={routes.candidateInterview(a.interviewToken!)}
      className="group relative grid grid-cols-1 overflow-hidden rounded-3xl bg-amber text-[#1a211d] shadow-[0_14px_30px_-24px_rgba(242,169,59,0.45)] transition-[transform,translate,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(242,169,59,0.55)] sm:grid-cols-[minmax(0,1fr)_260px]"
    >
      <span aria-hidden className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.18),transparent)]" />
      <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-7">
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-semibold tracking-[0.08em] uppercase opacity-70">Lo próximo · {left}</span>
          <span className="font-head text-[24px] leading-[1.1] font-semibold tracking-[-0.01em] sm:text-[28px]">Responde la entrevista de {a.jobTitle}</span>
          <span className="text-[14px] opacity-75">Unas preguntas por chat sobre tu experiencia. Unos 15 minutos, cuando te quede bien.</span>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1a211d] px-5 py-2.5 text-[14px] font-semibold text-[#f5f1e8]">
          Empezar ahora
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div aria-hidden className="relative hidden flex-col justify-center gap-2.5 bg-[#1a211d]/8 p-6 sm:flex">
        <span className="chat-q max-w-[210px] self-start rounded-2xl rounded-bl-md bg-[#fff8ea] px-3.5 py-2.5 text-[12.5px] leading-snug shadow-[0_6px_16px_-10px_rgba(0,0,0,0.4)]">
          ¿Cuántos servicios migraron a AKS y cuánto duró?
        </span>
        <span className="grid justify-items-end">
        <span className="chat-typing col-start-1 row-start-1 flex w-fit gap-1 self-start rounded-2xl rounded-br-md bg-[#1a211d] px-3.5 py-3">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-1.5 rounded-full bg-[#f5f1e8]/70 animate-breathe" style={{ animationDelay: `${d * 180}ms` }} />
          ))}
        </span>
        <span className="chat-a col-start-1 row-start-1 max-w-[210px] rounded-2xl rounded-br-md bg-[#1a211d] px-3.5 py-2.5 text-[12.5px] leading-snug text-[#f5f1e8]">
          Fueron 30 servicios en diez meses, por oleadas.
        </span>
        </span>
      </div>
    </Link>
  );
}
