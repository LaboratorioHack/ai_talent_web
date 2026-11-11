"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Sunset } from "lucide-react";

/** Preguntas para abrir el día. Se elige una al azar cada vez que se entra al inicio. */
const QUESTIONS = [
  "¿Qué vacante movemos hoy?",
  "¿A quién invitamos a entrevista hoy?",
  "¿Revisamos los mejores perfiles de la semana?",
  "¿Cerramos alguna vacante esta semana?",
  "¿Hay hojas de vida ilegibles por resolver?",
  "¿Qué entrevistas quedaron listas para leer?",
  "¿Ajustamos algún perfil de cargo?",
  "¿Quién pasa hoy a la lista de finalistas?",
  "¿Subimos las hojas de vida que llegaron ayer?",
  "¿Qué decisión destrabamos hoy?",
];

type Moment = "day" | "evening" | "night";

function pick(): { moment: Moment; text: string } {
  const h = new Date().getHours();
  const moment: Moment = h >= 6 && h < 17 ? "day" : h >= 17 && h < 19 ? "evening" : "night";
  const greeting = h >= 5 && h < 12 ? "Buenos días" : h >= 12 && h < 19 ? "Buenas tardes" : "Buenas noches";
  return { moment, text: `${greeting}. ${QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]}` };
}

/** Sol que gira despacio de día, atardecer que sube y baja, luna que se mece de noche. */
function SkyIcon({ moment }: { moment: Moment }) {
  if (moment === "night") return <Moon aria-hidden className="size-4 text-blue animate-[moon-rock_5s_var(--ease-in-out-soft)_infinite]" />;
  if (moment === "evening") return <Sunset aria-hidden className="size-4 text-warning animate-[sun-dip_4s_var(--ease-in-out-soft)_infinite]" />;
  return <Sun aria-hidden className="size-4 text-amber animate-[spin_18s_linear_infinite]" />;
}

/**
 * Subtítulo del inicio: saludo según la hora y una pregunta del catálogo.
 * Se decide en el cliente (el servidor no conoce la hora de la persona) y
 * cambia en cada visita a la pantalla.
 */
export function DailyQuestion() {
  const [state, setState] = useState<{ moment: Moment; text: string } | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => setState(pick()), 0);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <span className="flex min-h-[1.4em] items-center">
      {state ? (
        <span className="flex items-center gap-2 animate-fade-in">
          <SkyIcon moment={state.moment} />
          {state.text}
        </span>
      ) : (
        " "
      )}
    </span>
  );
}
