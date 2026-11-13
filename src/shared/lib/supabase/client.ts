"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";

/**
 * Cliente de Supabase para el navegador. Solo Auth (anon key): los datos se
 * piden a la API .NET, nunca a la Data API de Supabase.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

