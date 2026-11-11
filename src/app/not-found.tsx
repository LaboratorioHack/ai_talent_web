import Link from "next/link";
import { ButtonLink, Logo } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/** Pantalla 13 · No encontrado. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex h-12 items-center border-b border-border bg-surface px-4 sm:px-6 lg:px-12">
        <Link href={routes.home} aria-label="Inicio">
          <Logo />
        </Link>
      </header>
      <section className="stagger flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center [&>*]:animate-rise">
        <p className="font-head text-[84px] leading-none font-semibold text-ink-3" style={{ "--i": 0 } as React.CSSProperties}>
          404
        </p>
        <h1 className="font-head text-[28px] font-semibold" style={{ "--i": 1 } as React.CSSProperties}>
          Esta página ya no existe
        </h1>
        <p className="text-base text-ink-2" style={{ "--i": 2 } as React.CSSProperties}>
          Pudo ser eliminada o pertenece a otra organización.
        </p>
        <div className="flex gap-3 pt-3.5" style={{ "--i": 3 } as React.CSSProperties}>
          <ButtonLink href={routes.home}>Ir al inicio</ButtonLink>
          <ButtonLink href={routes.home} variant="outline">
            Cambiar de organización
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
