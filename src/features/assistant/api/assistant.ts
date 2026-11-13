import { browserApi } from "@/shared/lib/api-browser";

/** Quién habla con Criba AI: decide el endpoint y, en el API, qué contexto recibe la IA. */
export type AssistantAudience = "company" | "applicant";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Hasta 20 turnos (el límite del API); se envían los más recientes. */
const MAX_TURNS = 20;

/** La vacante que se está mirando (empresa): /vacancies/{id}, /rankings/{id}, /candidates?job={id}. */
function currentVacancyId(): string | null {
  const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const { pathname, search } = window.location;
  if (/^\/(vacancies|rankings)\//.test(pathname)) return pathname.match(uuid)?.[0] ?? null;
  return new URLSearchParams(search).get("job")?.match(uuid)?.[0] ?? null;
}

/** POST /assistant/chat (empresa) o /me/assistant/chat (postulante). ai_talent_back: AssistantService. */
export async function askCriba(audience: AssistantAudience, history: readonly ChatTurn[]): Promise<string> {
  const messages = history.slice(-MAX_TURNS);
  const body = audience === "company" ? { messages, vacancyId: currentVacancyId() } : { messages };
  const { reply } = await browserApi<{ reply: string }>(audience === "company" ? "/assistant/chat" : "/me/assistant/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return reply;
}
