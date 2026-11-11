import { Logo } from "@/shared/components/ui";

/** Esqueleto de la barra mientras llega la sesión. Misma altura que <Navbar>. */
export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl" aria-busy>
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-6 lg:h-[68px]">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <span aria-hidden className="hidden h-6 w-px bg-border-strong md:block" />
          <span className="hidden h-11 w-[200px] rounded-full bg-surface-2 animate-breathe md:block" />
        </div>
        <span className="hidden h-12 w-[640px] rounded-full bg-surface-2 animate-breathe lg:block" />
        <div className="flex items-center gap-2">
          <span className="size-11 rounded-full bg-surface-2 animate-breathe" />
          <span className="size-11 rounded-full bg-surface-2 animate-breathe" />
          <span className="size-11 rounded-full bg-surface-2 animate-breathe" />
        </div>
      </div>
    </header>
  );
}
