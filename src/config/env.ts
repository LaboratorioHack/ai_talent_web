const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const env = {
  apiUrl,
  /**
   * El servidor de Next no puede llamar una ruta relativa como "/api": si la
   * pública lo es, `API_INTERNAL_URL` da la dirección absoluta.
   */
  serverApiUrl: process.env.API_INTERNAL_URL || apiUrl,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** Mientras no haya backend, las features sirven datos de `shared/mocks`. */
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
} as const;
