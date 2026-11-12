import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { env } from "@/config/env";

/** Cliente de Supabase en el servidor, con la sesión leída de las cookies. */
export async function createSupabaseServerClient() {
  // Auth lee Date.now() para ver si el token venció: nunca en un prerender, ni siquiera en el de prefetch.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Desde un Server Component no se pueden escribir cookies; el proxy refresca la sesión.
        }
      },
    },
  });
}

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
