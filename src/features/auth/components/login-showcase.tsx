import { ResumeSheet } from "@/shared/components/resume/resume-sheet";
import { mockResumeDocs } from "@/shared/mocks";

/**
 * Panel derecho del login: la promesa del producto en una imagen. Una hoja de
 * vida en papel que se revisa al cargar (resaltador y notas con puntos), sobre
 * el resto del montón, en el escritorio oscuro.
 */
export function LoginShowcase() {
  const doc = mockResumeDocs.a1;
  return (
    <aside className="relative hidden flex-1 flex-col overflow-hidden border-l border-border bg-surface lg:flex">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(237,242,238,0.06)_1px,transparent_1.5px)] bg-[length:28px_28px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -bottom-40 size-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.14),transparent)]" />

      <div className="stagger relative flex flex-col gap-3 px-16 pt-16 [&>*]:animate-rise">
        <p className="eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
          Así revisa Criba
        </p>
        <h2 className="max-w-[520px] font-head text-[34px] leading-[1.1] font-semibold tracking-[-0.02em]" style={{ "--i": 1 } as React.CSSProperties}>
          Cada punto del puntaje apunta a la línea del CV que lo prueba.
        </h2>
      </div>

      <div className="relative mt-12 flex-1">
        <div aria-hidden className="paper absolute top-6 left-[14%] h-[640px] w-[620px] -rotate-6 rounded-[2px] opacity-60 brightness-75 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]" />
        <div aria-hidden className="paper absolute top-2 left-[22%] h-[640px] w-[620px] rotate-3 rounded-[2px] opacity-75 brightness-[0.8] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]" />
        <div className="absolute top-0 left-[16%] w-[700px] animate-[rise_900ms_var(--ease-out-soft)_200ms_both]">
          <ResumeSheet doc={doc} annotated score={92} reveal compact />
        </div>
      </div>
    </aside>
  );
}
