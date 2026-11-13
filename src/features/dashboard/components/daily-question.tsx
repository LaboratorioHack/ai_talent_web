"use client";

import { useEffect, useState } from "react";

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
  "¿Revisamos las hojas de vida que llegaron ayer?",
  "¿Qué decisión destrabamos hoy?",
];

type Moment = "day" | "evening" | "night";

function pick(): { moment: Moment; text: string } {
  const h = new Date().getHours();
  const moment: Moment = h >= 6 && h < 17 ? "day" : h >= 17 && h < 19 ? "evening" : "night";
  const greeting = h >= 5 && h < 12 ? "Buenos días" : h >= 12 && h < 19 ? "Buenas tardes" : "Buenas noches";
  return { moment, text: `${greeting}. ${QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]}` };
}

const SKY: Record<Moment, string> = {
  day: "bg-[linear-gradient(160deg,#fff3d6,#ffd486)]",
  evening: "bg-[linear-gradient(160deg,#ffd9b0,#ee8d4a)]",
  night: "bg-[linear-gradient(160deg,#2c3b55,#121a26)]",
};

/**
 * Icono dibujado del momento del día, en un círculo con el color del cielo:
 * sol con rayos que giran despacio, sol que se oculta, o luna que se mece
 * con estrellas que titilan.
 */
function SkyIcon({ moment }: { moment: Moment }) {
  return (
    <span aria-hidden className={`relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5 ${SKY[moment]}`}>
      <svg viewBox="0 0 32 32" className="size-full">
        {moment === "night" ? (
          <>
            <g className="origin-center animate-[moon-rock_5s_var(--ease-in-out-soft)_infinite] [transform-box:fill-box]">
              <path d="M19.5 9.5a7.5 7.5 0 1 0 4 13.6A6 6 0 0 1 19.5 9.5Z" fill="#f5f1e8" />
            </g>
            {[
              [9, 9, "0s"],
              [24, 8, "1.1s"],
              [8, 22, "2s"],
            ].map(([x, y, d]) => (
              <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="0.9" fill="#f5f1e8" className="animate-breathe" style={{ animationDelay: d as string }} />
            ))}
          </>
        ) : (
          <>
            <g className="origin-center animate-[spin_24s_linear_infinite] [transform-box:fill-box]">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="16" y1="4.5" x2="16" y2="7.5" stroke={moment === "day" ? "#e08a12" : "#c4541f"} strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${i * 45} 16 16)`} />
              ))}
            </g>
            <circle cx="16" cy="16" r="5.4" fill={moment === "day" ? "#f2a93b" : "#e86f2c"} />
            {moment === "evening" ? <rect x="0" y="21" width="32" height="11" fill="#ee8d4a" opacity="0.85" /> : null}
          </>
        )}
      </svg>
    </span>
  );
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
        <span className="flex items-center gap-2.5 animate-fade-in">
          <SkyIcon moment={state.moment} />
          {state.text}
        </span>
      ) : (
        " "
      )}
    </span>
  );
}
