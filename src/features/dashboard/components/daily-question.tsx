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
  "¿Subimos las hojas de vida que llegaron ayer?",
  "¿Qué decisión destrabamos hoy?",
];

function pick() {
  const h = new Date().getHours();
  const greeting = h >= 5 && h < 12 ? "Buenos días" : h >= 12 && h < 19 ? "Buenas tardes" : "Buenas noches";
  return `${greeting}. ${QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]}`;
}

/**
 * Subtítulo del inicio: saludo según la hora y una pregunta del catálogo.
 * Se decide en el cliente (el servidor no conoce la hora de la persona) y
 * cambia en cada visita a la pantalla.
 */
export function DailyQuestion() {
  const [text, setText] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setText(pick()), 0);
    return () => window.clearTimeout(t);
  }, []);
  return <span className="block min-h-[1.4em]">{text ? <span className="animate-fade-in">{text}</span> : " "}</span>;
}
