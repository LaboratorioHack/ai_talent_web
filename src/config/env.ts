export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** Mientras no haya backend, las features sirven datos de `shared/mocks`. */
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
} as const;
