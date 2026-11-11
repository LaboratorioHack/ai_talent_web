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
| 5 | `feat/ui-polish` | 4 | lista | Campos y tarjetas unificados, editor con aire, título fijo, toasts con salida y pila |
| 6 | `feat/theme-login` | 5 | lista | Tema claro del pen con piezas oscuras (`.dark-scope`), login con panel oscuro |
| 7 | `feat/onboarding-flow` | 6 | lista | Onboarding completo: organización, fuentes con conexión, primera vacante y pantalla final |
| 8 | `feat/home-dashboard` | 7 | lista | Inicio con KPIs, embudo, barras por vacante, mejores perfiles y pendientes |
| 9 | `feat/login-wizard-polish` | 8 | lista | Guardar y salir, pasos con regreso, descripción de la vacante |
| 10 | `feat/vacancies` | 9 | lista | Lista de vacantes, tablero de pipeline con arrastre, editar y eliminar |
| 11 | `feat/login-scene` | 10 | lista | Escena centrada del login: fuentes, criba y resultado en bucle |
| 12 | `feat/login-fixes` | 11 | lista | Login sin scroll en pantallas bajas, menús del onboarding por encima del pie, botones fijos en el modal de fuentes |
| 13 | `feat/navbar` | 12 | lista | Fuentes Funnel Display, Funnel Sans y Plex Mono; navbar de una fila fija; encabezado de página fijo que se encoge; transiciones entre pantallas; filtros en los gráficos del inicio |
| 14 | `feat/cv-ingest` | 13 | lista | 07 Ingesta con subida simulada (progreso, lectura, resultado por archivo), carpeta compartida y modal Evaluar |
| 15 | `feat/rankings` | 14 | lista | 08 Ranking con foco, 12 sin candidatos, 14 evaluando, 15 descartar y los modales de la 16; menús de los selects en portal |
| 16 | `feat/feedback-polish` | 15 | lista | Buscadores que se ensanchan, búsqueda de la barra en su sitio, tarjetas de vacante con cifras, entrada suave del editor |
| 17 | `feat/interviews` | 16 | lista | 09 Entrevista con transcripción en vivo simulada, contraste y modales |
| 18 | `feat/integrations` | 17 | lista | 10 Integraciones con estados, permisos de la IA, registro en vivo y modales de conexión |
| 19 | `feat/governance` | 18 | lista | 11 Auditoría: cifras, alertas de sesgo, atributos y decisiones |
| 20 | `feat/people-first` | 19 | lista | Ranking por vacante con sus mejores personas, chat de entrevista, bandeja de entrevistas, `ScrollArea`, panel de lo que falta en la ingesta, navbar que se recoge en un icono |
| 21 | `feat/pipeline` | 20 | lista | Tablero de pipeline para todas las vacantes con columnas de scroll propio, generador de candidatos en `shared/mocks`, arreglos del filtro del ranking y del foco del navbar |

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

## 5 · `feat/ui-polish`

- **Bug de animaciones**: las curvas `--ease-*` solo vivían en `@theme inline`, que Tailwind no publica como variables. Toda clase arbitraria de animación o transición que usara `var(--ease-…)` quedaba con duración 0 y todo parecía instantáneo. Ahora también están en `:root`. Regla: si una variable se usa con `var()` a mano, debe existir en `:root`.
- **Campos**: clase `.field-box` (borde suave, sombra mínima, anillo de foco de 4px, estados `is-invalid` / `is-valid`) para texto, selector, fecha, número y buscador. La etiqueta va sola arriba; ayuda y formato abajo en una línea (se acabó "Número de / vacantes" partido). Sin rótulos "Texto libre / Elegir de lista".
- **Fondo y tarjetas**: fondo `#f6f7f4` menos beige, líneas `#e1e6df`, clase `.card` para agrupar.
- **Editor de perfil**: datos en tarjeta 2×2, requisitos en tarjeta con cabecera y conteo, chips de tipo sobrios, título pegajoso que al bajar se vuelve barra flotante con subtítulo (área · cierre · requisitos), lateral fijo con su propio scroll. `useStuck()` en `shared/hooks`.
- **Onboarding**: pregunta, formulario (en tarjeta) y pie alineados en la misma columna; `StepFrame bare` para contenido que ya son tarjetas.
- **Toasts**: entran y salen animados; al salir su fila se cierra para que la pila se deslice; máximo 3 visibles; pasar el ratón pausa el tiempo; barra fina de tiempo restante.
- **Select dentro de filas animadas**: la fila con el menú abierto sube de capa (`has-[[aria-expanded=true]]:z-30`), si no las filas siguientes lo tapaban.

## 13 a 20 · Pantallas del prototipo y correcciones

- **Navbar** (`shared/components/layout/navbar.tsx`): una fila fija de 68 px. Al enfocar la búsqueda (clic o Ctrl K) el campo se ensancha en su sitio, las secciones se recogen en un botón con el icono de la sección actual y los resultados salen debajo (`nav-search.tsx`). Avisos y cuenta usan `Popover`.
- **Encabezado de página** (`PageTop`): fijo bajo la barra; al bajar se encoge y al volver arriba recupera su tamaño. `useStuck` mide el scroll con histéresis y no se encoge si la página es tan corta que entraría en bucle.
- **Transiciones**: `app/(dashboard)/template.tsx` anima la entrada de cada pantalla sin dejar `transform` al terminar (no rompe sticky ni fixed).
- **UI nueva en `shared/components/ui`**: `Popover`, `Segmented` (píldora deslizante, contadores en pastilla), `AnimatedNumber`, `ScrollArea` (barra propia arrastrable con bordes difuminados), `Modal size="lg"`. `SearchField` se ensancha al enfocarse y vuelve al perder el foco o al hacer scroll. Los menús de `Select` viven en un portal (body o el `<dialog>`), así nada los tapa.
- **Inicio**: filtros de período y vacante que recalculan cifras, tendencia diaria con guía al pasar el ratón, embudo con cifras centradas y barras por vacante con el número dentro de cada tramo. Subtítulo con saludo y una pregunta al azar.
- **07 Ingesta** (`features/cv-upload`): `useIngest` simula subida, lectura y resultado según el archivo (PDF, Word o fotos se leen; comprimidos se rechazan; "carta" no es hoja de vida; "scan" queda ilegible; nombres repetidos son duplicados). Panel "Qué falta resolver" con acciones en lote (pedir originales, quitar duplicadas o rechazadas) y barra inferior para evaluar.
- **08 Ranking** (`features/rankings`): portada por vacante con sus tres mejores personas y sus citas; ranking de la vacante con lista, foco, composición del puntaje, evidencia por requisito y modales (invitar, invitación enviada, descartar con motivo, error de la IA, equivalencias, hoja de vida anotada). `?evaluando=N` muestra la pantalla 14; una vacante sin hojas de vida, la 12.
- **09 Entrevistas** (`features/interviews`): bandeja (en vivo, para decidir, esperando) con vista previa; la entrevista es un chat centrado que abre al final y recibe respuestas en vivo simuladas. Programar con el equipo, descargar transcripción (.txt) y descartar.
- **10 Integraciones** (`features/integrations`): logos oficiales, estados (conectado, error, sin conectar, pausado), sincronizar, reautorizar, conectar con clave, añadir del catálogo, permisos de la IA y registro que crece con cada acción.
- **11 Gobierno** (`features/governance`): cifras por período, alertas de sesgo con revisión, atributos agrupados y decisiones como línea de tiempo por día con filtro por persona, ambos con `ScrollArea`. Exporta CSV.
- **05 Tablero**: `getPipeline` arma las tarjetas con el mismo generador del ranking (`mockCandidatesOf` en `shared/mocks/candidates.ts`), así cifras, nombres y puntajes coinciden entre pantallas.
- **Servidor de desarrollo**: si los estilos no cambian, borrar `.next/dev` y `.next/cache` y reiniciar `pnpm dev`; Turbopack a veces sirve CSS viejo.

## Landing (repo aparte `ai_talent_landing`)

Astro 7 + Tailwind v4, estática y en oscuro (tinta verde de la marca, resaltador ámbar; nada espacial). Repo git **local** (sin remoto todavía): `main` tiene el andamiaje y `feat/landing` todo lo demás. Hay que crear el repo en GitHub y empujar ambas ramas. Detalle en su `README.md`.

- **Hero**: titular con palabra que rota bajo el resaltador y una hoja de vida que se revisa sola (resaltador, notas al margen con puntos, sello final); las demás hojas se abren en abanico con el scroll.
- **Fuentes**: sección fija; al bajar se enciende cada plataforma (LinkedIn, Computrabajo, elempleo, Indeed, Greenhouse, Drive, Gmail) y suelta una hoja que cae en la bandeja de Criba.
- **La criba** (idea central): lista de postulantes que pasa tres filtros con el scroll; se ilumina la columna evaluada y las filas que no pasan se cierran.
- **Cómo evalúa** (tres demos vivas), **Gobierno de IA** (franja breve) y **cierre** con un tamiz en perspectiva que gira en reposo y criba granos.
- Sin precios ni "50 hojas gratis": no venían de ningún requisito.
- `pnpm dev` → `http://localhost:4321`. `PUBLIC_APP_URL` apunta a la app Next.

## Pendiente

- Conectar las `api/` de cada feature a los endpoints reales cuando existan (cada función indica su ruta en el comentario).
- La landing sigue con Bricolage e Instrument; si se quiere la misma tipografía que la app, cambiar a Funnel Display y Funnel Sans.
- Anon key de Supabase en `.env.local` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`); hoy está vacía y la app corre en modo mock.
- Proveedores OAuth en `supabase/config.toml` si se quieren los botones Google / Microsoft.
- Tests: el CI corre `pnpm test --if-present` y aún no hay runner configurado.

## Convenciones

- Commits atómicos, en inglés, ≤ 70 caracteres, tipo `feat: …` / `fix: …` / `chore: …`, sin paréntesis ni coautoría.
- Una feature no importa de otra feature; lo común sube a `shared/`.
- Mientras no haya backend: `NEXT_PUBLIC_USE_MOCKS=true` en `.env.local` y las `api/` de cada feature devuelven datos de `src/shared/mocks`.
