import { CalendarX2 } from "lucide-react";
import { ButtonLink } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/**
 * La vacante no existe, sigue en borrador, se cerró o venció su fecha de cierre. Va dentro del
 * marco del postulante (sin una segunda barra) y lo lleva a las vacantes abiertas.
 */
export default function JobNotFound() {
  return (
    <section className="stagger flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center [&>*]:animate-rise">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-2 ring-1 ring-border" style={{ "--i": 0 } as React.CSSProperties}>
        <CalendarX2 aria-hidden className="size-6" />
      </span>
      <h1 className="font-head text-[28px] font-semibold" style={{ "--i": 1 } as React.CSSProperties}>
        Esta vacante no recibe postulaciones
      </h1>
      <p className="max-w-[440px] text-base text-ink-2" style={{ "--i": 2 } as React.CSSProperties}>
        Puede que ya se haya cerrado, que su fecha de cierre pasó o que la empresa todavía no la publica.
      </p>
      <div className="pt-3.5" style={{ "--i": 3 } as React.CSSProperties}>
        <ButtonLink href={routes.portalJobs}>Ver vacantes abiertas</ButtonLink>
      </div>
    </section>
  );
}
