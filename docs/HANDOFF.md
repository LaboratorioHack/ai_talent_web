# Handoff · Frontend (Manuel · UX/UI)

Bitácora de lo que hay hecho, en qué rama vive y cómo seguir. Se actualiza al cerrar cada rama.
La fuente de verdad del diseño es el archivo de pen.dev `untitled.pen` (frames `00 Landing` … `16 Modales`, y `Criba · Componentes`).

## Stack de ramas (PR stack sobre `develop`)

| # | Rama | Base | Estado | Qué trae |
|---|------|------|--------|----------|
| 1 | `feat/design-system` | `develop` | lista | Tokens, fuentes, kit de UI compartido, `/design` |
| 2 | `feat/app-shell` | 1 | lista | Movimiento, tipos de dominio, mocks, navbar, layout del panel, rutas y 404 |
| 3 | `feat/auth-onboarding` | 2 | lista | Supabase Auth, login, onboarding 2–4, editor de perfil de cargo |
| 4 | `feat/custom-select` | 3 | lista | Desplegable propio animado; reemplaza todos los `<select>` nativos |

Abrir las PRs en orden: cada una apunta a la anterior como base. Al mergear la 1, la 2 se rebasea sobre `develop`, y así.

## 1 · `feat/design-system`

**Tokens** en [src/styles/globals.css](../src/styles/globals.css) (Tailwind v4, `@theme inline`). Colores de marca: `bg`, `surface`, `surface-2`, `border`, `ink` / `ink-2` / `ink-3`, `blue` (+`-soft`), `success` / `warning` / `danger` (+`-soft`), `amber`, `panel`. Fuentes: `font-head` (Bricolage Grotesque, títulos y cifras), `font-sans` (Instrument Sans), `font-mono` (JetBrains Mono, datos verificables). Utilidad `.eyebrow` para rótulos tipo `PASO 2 DE 4`.

**Kit de UI** en [src/shared/components/ui](../src/shared/components/ui) (importar desde `@/shared/components/ui`):

- `Button` · variantes `ink | outline | text | danger | blue`, tamaños, `loading`, `icon`, `block`. Regla: un botón de tinta por pantalla.
- `StatusChip` · `meets | partial | does_not_meet | evaluating | unevaluated | discarded`. Siempre texto + color.
- `TextField`, `SelectField`, `NumberField` (stepper − / +), `DateField` (abre `Calendar` en popover), `SearchField`, `Toggle`, `Tabs`, `Steps` + `ProgressSegments`.
- `Modal` (`<dialog>` nativo, Escape, velo), `useToast()` (`success | error | progress`, con acción "Deshacer"). `ToastProvider` ya está montado en el layout raíz.
- `EmptyState`, `Avatar` (solo iniciales: nunca mostramos la foto del candidato), `Logo`.
- Helpers: `cn()` en `shared/lib/cn.ts`; fechas en español en `shared/lib/dates.ts` (`formatDateDisplay`, `monthGrid`, `toISODate`…).

**Guía viva**: `http://localhost:3000/design` muestra todo con sus estados (error, vacío, deshabilitado, validado, cargando).

**Decisiones**

- Los avatares del diseño llevan foto de Unsplash; en código usamos iniciales. Mostrar foto contradice "IA responsable" y el propio texto de la pantalla 08.
- La zona de carga NO limita a 100 archivos. El mensaje habla de formatos: PDF, DOCX, imagen o escaneo, con cualquier estructura de CV.
- La landing (frame `00 Landing`) se hace en Astro, en un proyecto aparte (`ai_talent_landing`), no en Next.

## 2 · `feat/app-shell`

**Movimiento** (en `globals.css`): nada es inmediato. Curvas `--ease-out-soft`, `--ease-spring`; animaciones `animate-rise`, `animate-pop-in`, `animate-toast-in`, `animate-fade-in`, `animate-breathe` (esqueletos), `.grow-x` (barras que crecen) y `.stagger` + `--i` para aparición escalonada. Se respeta `prefers-reduced-motion`. `/design` responde 404 en producción.

**Dominio y mocks**: tipos en [src/shared/types/domain.ts](../src/shared/types/domain.ts) (siguen el esquema de Supabase). Datos de ejemplo en [src/shared/mocks](../src/shared/mocks): organización y pendientes, 7 vacantes (la de Cloud Senior con 7 requisitos y equivalencias), 10 postulaciones con evaluación completa de la #1, archivos de ingesta en todos los estados, entrevista con contrastes, integraciones + registro, auditoría. `delay()` simula latencia.

**Shell**: `Navbar` (fila de contexto + pestañas, activa por `usePathname`), `OrgSwitcher` (modal "Cambiar de organización"), `PageHeader` / `PageBody`, `NavbarSkeleton`. El layout de `(dashboard)` streamea la barra bajo `Suspense` porque Cache Components exige envolver datos no cacheados. Rutas en [src/shared/constants/routes.ts](../src/shared/constants/routes.ts): `/home`, `/vacancies`, `/candidates`, `/rankings`, `/interviews`, `/integrations`, `/governance`. `/` redirige a `/home`. Cada ruta tiene por ahora cabecera + estado vacío con su siguiente paso.

**Para Santiago**: las pantallas 05 (tablero), 06 (perfil de cargo), 07 (ingesta) y 08 (ranking) tienen todo listo para montarse: mocks, tipos, `StatusChip`, `Avatar`, `PageHeader`. La `api/` de cada feature debe mirar `env.useMocks` como hace `features/auth/api/session.ts`.

## 3 · `feat/auth-onboarding`

**Supabase Auth** (solo Auth en el navegador, con anon key): clientes en [src/shared/lib/supabase](../src/shared/lib/supabase) (`client.ts` navegador, `server.ts` con cookies). `src/proxy.ts` (el "middleware" de Next 16) refresca la sesión y manda a `/login?next=…` si no hay usuario; `/auth/callback` cierra el OAuth y los enlaces de invitación. Si faltan `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY`, todo corre en modo mock y el login siempre entra. El backend tiene `enable_signup = false` (solo invitación), correo + contraseña y ningún proveedor OAuth habilitado: los botones Google / Microsoft están cableados a `signInWithOAuth` y muestran un toast si el proveedor no existe. Para activarlos: habilitar `[auth.external.google]` / `azure` en `supabase/config.toml` y registrar `http://localhost:3000/auth/callback` como redirect.

**Login** (`/login`, pantalla 01): `features/auth` con `loginSchema` (zod), `LoginForm` (react-hook-form), `ProviderButton`, `organizationFromEmail()` detecta la empresa por el dominio. El panel oscuro (`EvidencePanel`) ya no muestra candidatos con nombre y foto: muestra el ranking **anonimizado** (nombre tachado, foto omitida) con barras que crecen, que es exactamente lo que el modelo ve.

**Onboarding** (`/onboarding/2|3|4`, pantallas 02–04): `features/onboarding` con `StepFrame`, `OrganizationStep` (chips de correos para invitar), `SourcesStep` (tarjetas seleccionables; el copy de "Subir archivos" habla de formatos, no de un límite de 100) y `FirstVacancyStep`, que compone el editor de la feature `vacancies`.

**Editor de perfil de cargo** (`features/vacancies/components/RoleProfileEditor`): sirve igual para la pantalla 06 (`/vacancies/[id]/profile`). Tabla de requisitos con tipo (obligatorio / deseable / descalificante), peso con stepper, equivalencias como chips (`GCP 80` → `GCP ≈ 80 %`), lateral "Cómo se puntúa" con suma de pesos en vivo y umbrales. Validación con `roleProfileDraftSchema`. "Pegar la descripción del cargo" queda como botón inerte hasta que el AI Engine exponga el endpoint.

**Cache Components, dos reglas que ya nos mordieron**: no usar `new Date()` en el render de un Client Component (hook `useToday()` en `shared/hooks`), y no leer `params` / `searchParams` fuera de `Suspense` (por eso los pasos son rutas estáticas `2/`, `3/`, `4/`).

## 4 · `feat/custom-select`

**`Select`** en [src/shared/components/ui/select.tsx](../src/shared/components/ui/select.tsx): desplegable propio con patrón combobox de solo selección. Controlado (`value` + `onChange(value)`) o no controlado (`defaultValue`). Teclado completo: flechas, Inicio/Fin, Enter/Espacio, Escape, Tab y búsqueda por letra. Animación de apertura y de cierre (la lista se queda montada mientras sale), chevron que gira, opciones que entran escalonadas y check con resorte. Opciones con `hint` opcional. `triggerClassName` permite disparadores con otro aspecto, como el chip de tipo de requisito.

**`SelectField`** ahora envuelve `Select` con `Field`. **Cambio de API**: `onChange` recibe el valor, no el evento. Ya no hay `<select>` nativos en el código.

**Hooks nuevos** en `shared/hooks`: `usePresence(open)` (montar mientras corre la salida) y `useDismiss(ref, open, onClose)` (clic fuera + Escape). `DateField` los usa también y ahora anima su salida. El `Modal` deja desbordar los popovers.

## Landing (repo aparte `ai_talent_landing`)

Astro 7 + Tailwind v4, estática. Repo git **local** recién creado (sin remoto todavía): `main` tiene el andamiaje y `feat/landing` todo lo demás. Hay que crear el repo en GitHub (`LaboratorioHack/ai_talent_landing`) y empujar ambas ramas. Detalle en su `README.md`.

- Hero con **lector de hojas de vida** animado en bucle: un haz recorre el documento, tacha foto / edad / dirección, ilumina la línea que prueba cada requisito y el puntaje sube hasta 92. Sustituye a los candidatos con nombre y foto del diseño.
- "Cómo evalúa" contado con scroll: el texto avanza y un escenario fijo cambia (formatos de archivo → requisitos → ranking).
- Gobierno de IA con chips que se tachan al aparecer y contadores; marquesina de integraciones; precios; barra de progreso de lectura.
- `pnpm dev` → `http://localhost:4321`. `PUBLIC_APP_URL` apunta a la app Next.

## Pendiente

- Pantallas de Santiago sobre este stack: 05 tablero, 06 perfil (reusar `RoleProfileEditor`), 07 ingesta, 08 ranking, 09 entrevista, 10 integraciones, 11 auditoría.
- Anon key de Supabase en `.env.local` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`); hoy está vacía y la app corre en modo mock.
- Proveedores OAuth en `supabase/config.toml` si se quieren los botones Google / Microsoft.
- Tests: el CI corre `pnpm test --if-present` y aún no hay runner configurado.

## Convenciones

- Commits atómicos, en inglés, ≤ 70 caracteres, tipo `feat: …` / `fix: …` / `chore: …`, sin paréntesis ni coautoría.
- Una feature no importa de otra feature; lo común sube a `shared/`.
- Mientras no haya backend: `NEXT_PUBLIC_USE_MOCKS=true` en `.env.local` y las `api/` de cada feature devuelven datos de `src/shared/mocks`.
