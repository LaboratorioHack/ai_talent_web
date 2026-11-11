# Handoff · Frontend (Manuel · UX/UI)

Bitácora de lo que hay hecho, en qué rama vive y cómo seguir. Se actualiza al cerrar cada rama.
La fuente de verdad del diseño es el archivo de pen.dev `untitled.pen` (frames `00 Landing` … `16 Modales`, y `Criba · Componentes`).

## Stack de ramas (PR stack sobre `develop`)

| # | Rama | Base | Estado | Qué trae |
|---|------|------|--------|----------|
| 1 | `feat/design-system` | `develop` | lista | Tokens, fuentes, kit de UI compartido, `/design` |
| 2 | `feat/app-shell` | 1 | lista | Movimiento, tipos de dominio, mocks, navbar, layout del panel, rutas y 404 |

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

## Convenciones

- Commits atómicos, en inglés, ≤ 70 caracteres, tipo `feat: …` / `fix: …` / `chore: …`, sin paréntesis ni coautoría.
- Una feature no importa de otra feature; lo común sube a `shared/`.
- Mientras no haya backend: `NEXT_PUBLIC_USE_MOCKS=true` en `.env.local` y las `api/` de cada feature devuelven datos de `src/shared/mocks`.
