# AI Talent Scout — Web

Next.js 16 (App Router) con arquitectura **feature-based**. Gestor de paquetes: **pnpm** (versión fijada en `packageManager` de `package.json`; `npm`/`yarn` no se usan).

```bash
pnpm install
pnpm dev
```

```
src/
  app/                 Solo rutas y layouts (delgado): importa desde features/
    (auth)/login
    (dashboard)/vacancies | candidates | rankings | interviews
  features/<feature>/  Todo lo de un dominio junto
    components/  hooks/  api/ (llamadas a la API .NET)  types/  schemas/ (zod)
    features: auth, vacancies, candidates, cv-upload, evaluations, rankings, interviews
  shared/              Reutilizable y sin lógica de dominio (ui, layout, hooks, lib, types, constants)
  config/  providers/  styles/
tests/unit  tests/e2e
```

Regla: una feature **no importa** de otra feature; lo común sube a `shared/`.

## Seguridad (OWASP Top 10:2025)
- El navegador **solo** usa Supabase para **Auth** (anon key). Los datos se piden a la API .NET, nunca a la Data API de Supabase.
- Nunca pongas la `service_role key` ni secretos en variables `NEXT_PUBLIC_*`: se incrustan en el bundle público.
- CSP y `Permissions-Policy` en [next.config.ts](next.config.ts); HSTS/nosniff/Referrer-Policy los pone Caddy.
- Supply chain: `pnpm audit` + dependency-review en PR, Dependabot y `minimumReleaseAge` (24h) en `pnpm-workspace.yaml`.

Detalle completo en `ai_talent_back/SECURITY.md`.

## CI/CD
- `pull_request` → `ci.yml`: lint, typecheck, tests, build y auditoría de dependencias. Check requerido: `ci-ok`.
- `push` a `main` → `cd.yml`: imagen a GHCR + deploy en EC2 (`docker compose up -d web`). No repite lint/tests.

El `docker-compose.yml` del servidor lo despliega `ai_talent_back` (despliégalo primero).
Secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`. Variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
