import { Logo } from "@/shared/components/ui";

/** Esqueleto de la barra mientras llega la sesión. Misma altura que <Navbar>. */
export function NavbarSkeleton() {
  return (
    <header className="border-b border-border bg-surface" aria-busy>
      <div className="flex h-12 items-center gap-3.5 border-b border-border px-12">
        <Logo />
        <span aria-hidden className="text-ink-3">
          /
        </span>
        <span className="h-7 w-40 rounded-md bg-surface-2 animate-breathe" />
        <div className="flex-1" />
        <span className="h-[34px] w-[300px] rounded-md bg-surface-2 animate-breathe" />
        <span className="size-7 rounded-full bg-surface-2 animate-breathe" />
      </div>
      <div className="flex h-[42px] items-center gap-6 px-12">
        {[64, 72, 80, 70, 88, 90, 76].map((w, i) => (
          <span key={i} className="h-3 rounded bg-surface-2 animate-breathe" style={{ width: w, animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    </header>
  );
}
