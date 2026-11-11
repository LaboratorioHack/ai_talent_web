import { Logo } from "@/shared/components/ui";

/** Esqueleto de la barra mientras llega la sesión. Misma altura que <Navbar>. */
export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl" aria-busy>
      <div className="flex h-[68px] items-center justify-between gap-6 px-8">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <span aria-hidden className="h-6 w-px bg-border-strong" />
          <span className="h-11 w-[200px] rounded-full bg-surface-2 animate-breathe" />
        </div>
        <span className="h-12 w-[640px] rounded-full bg-surface-2 animate-breathe" />
        <div className="flex items-center gap-2">
          <span className="h-11 w-[250px] rounded-full bg-surface-2 animate-breathe" />
          <span className="size-11 rounded-full bg-surface-2 animate-breathe" />
          <span className="size-11 rounded-full bg-surface-2 animate-breathe" />
        </div>
      </div>
    </header>
  );
}
