import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">AI Talent Scout</h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        Evaluación automática de hojas de vida frente a un perfil de cargo, con ranking explicado
        y sin sesgos por datos personales.
      </p>
      <Link
        href="/vacancies"
        className="rounded-full bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-90"
      >
        Ver vacantes
      </Link>
    </main>
  );
}
