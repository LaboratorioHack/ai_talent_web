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
| 22 | `fix/short-pages` | 21 | lista | Encabezados sin sticky en pantallas de alto fijo, barras flotantes opacas y sin compactar en páginas cortas |
| 23 | `feat/brand-mark` | 22 | lista | Logo nuevo (hoja con una línea resaltada) en la app, favicon `app/icon.svg`, icono de edificio en el selector de organización |
| 24 | `fix/smooth-errors` | 23 | lista | `Collapse` compartido; ayuda y errores de los campos entran y salen con transición de alto |
| 25 | `feat/dark-mode` | 24 | lista | Modo oscuro con interruptor sol y luna en el navbar, sin parpadeo al cargar (`shared/lib/theme.ts`), cambio con View Transitions en círculo; navbar que cabe desde 1366 px |
| 26 | `feat/floating-headers` | 25 | lista | Encabezados de página como tarjetas flotantes redondeadas, icono dibujado del momento del día en el saludo, gradiente verde del modo oscuro |
| 27 | `fix/theme-switch` | 26 | lista | Barrido circular del tema con la perilla deslizándose aparte (`view-transition-name`), sol y luna dibujados; las transiciones con `transform` también animan `translate`, `scale` y `rotate` (Tailwind v4 los usa por separado) |
| 28 | `feat/responsive` | 27 | lista | Toda la app en celular y tablet: menú propio en el navbar, búsqueda a ancho completo, márgenes 16/24/48 px, paneles de dos columnas que se apilan, tablero con columnas que se desplazan, tablas que pasan a filas |
| 29 | `feat/mvp-scope` | 28 | lista | Ajuste al documento de alcance del MVP: onboarding sin Fuentes, sin integraciones ni cambio de organización, login sin OAuth, canales empresa/candidato, datos coherentes y páginas del candidato |
| 30 | `fix/dark-hover-skeleton` | 29 | lista | Hovers translúcidos (`--hover`), esqueletos con barrido y encabezado de carga igual a `PageTop`, fechas de entrevista sin zona horaria |
| 31 | `feat/applications-board` | 30 | lista | Postulaciones: convocatoria con enlace público y canales, tablero Recibidas / Necesitan acción / Listas; la carga en bloque pasa a secundaria |
| 32 | `feat/texture` | 31 | lista | Fondo con grano fino y luz suave en claro y oscuro (solo el fondo; las tarjetas quedan limpias) |
| 33 | `feat/public-job-details` | 32 | lista | Ficha de vacante tipo portal de empleo: datos clave, perfil deducido, requisitos agrupados con equivalencias, ¿Encajas?, proceso |
| 34 | `feat/applicant-portal` | 33 | lista | Portal del postulante: entrada con enlace mágico, inicio, mis postulaciones con etapas, detalle con retiro, vacantes con filtros, perfil con lo que ve la IA y borrado de datos |
| 35 | `feat/portal-redesign` | 34 | lista | Sin textura; lado del candidato en verde oscuro y sin tarjetas de adorno; hoja de vida con vista previa y edición; arreglo del hover de botones en oscuro |
| 36 | `feat/portal-depth` | 35 | lista | Profundidad sin textura: luces de fondo (`.portal-light`), resaltador ámbar (`.hl`), bloque "Lo próximo" con cuenta regresiva y chat en bucle, filas con monograma y riel animado, hoja de vida en pila de papeles, últimos movimientos |
| 37 | `feat/portal-theme` | 36 | lista | Portal claro/oscuro con interruptor, textura de contornos (`--contours`), pestañas con contador, entrada propia del postulante, lector de PDF compartido (`shared/components/pdf`), hoja de vida como PDF editable (`shared/lib/resume-pdf.ts`) y PDF en ranking y postulaciones |
| 38 | `feat/portal-panels` | 37 | lista | Tarjetas translúcidas (`.panel`) para que el texto del postulante se lea sobre la textura |
| 39 | `feat/criba-ai` | 38 | lista | Textura de arcos para empresa (`.org-light`), filtro propio en cada gráfico del Inicio, marca Criba AI en ambos portales, recomendaciones al postulante y tarjeta de hoja de vida con miniatura del PDF |
| 40 | `fix/jobs-list-spacing` | 39 | lista | Más aire alrededor de las flechas en la lista de vacantes del postulante |
| 41 | `feat/criba-ai-live` | 40 | lista | Criba AI trabajando a la vista: registro en vivo en el Inicio, tarjeta "leyendo" en Postulaciones, barrido de la hoja de vida del postulante y "comparó tu hoja de vida con N vacantes"; sombras del bloque ámbar más suaves; landing en el pen.dev |

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
- **Transiciones de movimiento**: Tailwind v4 mueve con las propiedades `translate`, `scale` y `rotate`, no con `transform`. Una lista arbitraria como `transition-[transform,...]` debe incluirlas o el movimiento salta de golpe.
- **Servidor de desarrollo**: no correr `next build` con `pnpm dev` encendido (mezcla chunks y da errores de hidratación como "Candidatos" vs "Postulaciones"). Si los estilos no cambian, borrar `.next/dev` y `.next/cache` y reiniciar `pnpm dev`; Turbopack a veces sirve CSS viejo.


## 29 · `feat/mvp-scope` (documento de alcance del MVP, 11/11)

Fuente: `AI-Talent-Scout-MVP.docx` (borrador 0.1). Lo marcado como **Fuera** se quitó; lo **Por confirmar** se dejó construido pero fácil de retirar.

- **Onboarding en 3 pasos**: Cuenta (login), Organización (nombre, sector, tamaño) y Primera vacante. Sin el paso Fuentes ni "Invita a tu equipo". `/onboarding/1` redirige al login (antes daba 404). Rutas: `routes.onboarding(2 | 3)`.
- **Fuera del MVP**: `features/integrations`, `/integrations` y su pestaña; el selector de organización (ahora `OrgBadge`, solo el nombre); "Conectar carpeta compartida" en la ingesta; botones Google / Microsoft del login. Los avisos y pendientes ya no hablan de tokens de LinkedIn.
- **Login**: "Entra a Criba" (cuentas por invitación), enlace "¿Olvidaste tu contraseña?" con `requestPasswordReset` (Supabase `resetPasswordForEmail`). La escena del panel muestra formatos (PDF, Word, escaneo) y la postulación del candidato, no logos de plataformas. La regla de 8 o 12 caracteres sigue pendiente con Jean.
- **Canales** (`applications.source`): la ingesta filtra por "Subidas por la empresa" o "Postulaciones de candidatos"; las filas de candidato llevan la marca "Se postuló". Lo mismo en el tablero y en el foco del ranking.
- **Datos coherentes**: organización ficticia **Cordillera Financiera** (antes un banco real). Cloud Senior: 92 recibidas = 84 leídas + 8 por resolver, igual en Vacantes, Hojas de vida, tablero y panel (30 y 90 días muestran lo mismo). Julián Ríos (no "Rivas"). Entrevista: "5 de 9 respondidas" y "pregunta 6 de 9". Gobierno ya no inventa alertas de sesgo: solo se muestran si la API las calcula; en su lugar, "errores de la IA marcados por personas". Las cifras de Gobierno salen de las vacantes.
- **Inicio**: KPIs, embudo, resultado por vacante, mejores perfiles y pendientes. Se quitó la tendencia diaria (era una serie inventada).
- **Candidato (pantallas 16–18, sin sesión)**, en `features/candidates` y el grupo `app/(public)`:
  - `/jobs/[id]`: vacante pública (cargo, lo que buscamos, cómo se revisa) y formulario con nombre, correo, hoja de vida (PDF o Word, 10 MB) y autorización Habeas Data (`applicationSchema`). Nunca muestra pesos, puntajes ni descalificantes.
  - `/jobs/[id]/applied`: confirmación y qué sigue.
  - `/interview/[token]`: entrevista IA por chat, solo texto. Intro, preguntas con barra de progreso, repregunta una vez si la respuesta es corta, y cierre sin puntaje. El token hoy es el id de la entrevista (`i-4` está pendiente; `i-2` ya terminó).
  - `proxy.ts` deja pasar `/jobs` y `/interview/` sin sesión.
  - Endpoints que esperan (ver comentarios en `features/candidates/api`): `GET /public/vacancies/{id}`, `POST /public/vacancies/{id}/applications` (multipart), `GET /public/interviews/{token}`, `POST /public/interviews/{token}/turns`.
- **Empresa ↔ candidato**: botón "Enlace de postulación" en el tablero de una vacante abierta (copia `/jobs/{id}`), enlace en el ranking vacío, y "Ver lo que recibe" en una entrevista pendiente. Las entrevistas se movieron a `shared/mocks/interviews.ts` para que ambas vistas lean lo mismo.
- **Landing** (rama `feat/mvp-scope` sobre `feat/responsive` en `ai_talent_landing`): sin la sección Fuentes; "Postularme" abre `/jobs/{id}` de la app y "Subir mi hoja de vida" baja a las vacantes.


## 30 a 34 · Pulido, postulaciones, textura y portal del postulante

- **Tokens nuevos** en `globals.css`: `--hover` (translúcido, aclara en oscuro y oscurece en claro) y `--skeleton` / `--skeleton-hi` para `.skeleton`. Toda clase `hover:bg-surface-2` pasó a `hover:bg-hover`. `PageTopSkeleton` en `shared/components/layout`.
- **Hidratación**: `when()` de entrevistas lee la fecha del texto, sin `Date`, para que servidor y navegador coincidan en cualquier zona horaria. Si vuelve a salir, reiniciar `pnpm dev` (un `next build` con el dev corriendo deja chunks mezclados).
- **Postulaciones** (`/candidates`, pestaña "Postulaciones"): `CallPanel` (enlace público, cierre, canales) y tablero de tres columnas con `FileCard`. `CopyApplyLink` vive ahora en `shared/components/share`.
- **Textura**: `--grain` (ruido SVG en data URI) como primera capa del fondo de `body`, con luces radiales. Nada de cuadrícula.
- **Ficha pública** (`/jobs/[id]`): `features/candidates/lib/infer.ts` deduce nivel, experiencia e idioma y escribe las equivalencias ("GCP o AWS también cuentan"). Ubicación, modalidad, contrato y jornada vienen de `LISTING` en el mock: **la vacante aún no guarda esos campos** (hay que sumarlos al editor y al back). Salario muestra "A convenir" cuando no existe.
- **Portal del postulante** (`app/(candidate)/portal`, `features/candidates/components/portal`): `/portal`, `/portal/applications`, `/portal/applications/[id]`, `/portal/jobs`, `/portal/profile` y `/portal/sign-in` (enlace mágico con `signInWithOtp`). El proxy manda a `/portal/sign-in` si no hay sesión. Etapas para la persona: Recibida, En revisión, Entrevista, Decisión; nunca puntajes. Endpoints esperados: `GET /me/applicant`, `/me/applications`, `/me/applications/{id}`, `/me/resume`, `/public/vacancies`. La separación de roles (candidato vs. reclutador) la debe validar la API.
- **pen.dev**: tokens actualizados a la paleta y fuentes actuales (Funnel Display / Funnel Sans / IBM Plex Mono, tema claro y oscuro). Tableros nuevos "MVP · Empresa" y "MVP · Postulante" con las pantallas importadas desde la app; Fuentes e Integraciones movidas a "Archivo · fuera del MVP".


## 35 · `feat/portal-redesign`

Feedback de Manuel: el gris con tarjetas blancas, la textura y el exceso de texto sobre la IA no gustaron.

- **Textura eliminada** (revert de `feat/texture`). El fondo vuelve a ser plano.
- **Todo lo del candidato va en oscuro** (`dark-scope` en `app/(candidate)/portal/layout.tsx` y `app/(public)/layout.tsx`), con el verde y el ámbar de la landing. Sin selector de tema.
- **Menos cajas**: postulaciones y vacantes son filas con líneas finas (`ApplicationRow`, `JobsBrowser`); el detalle es texto, puntos de etapa y una lista. Lo único que sigue en panel es el formulario de postulación.
- **Mi hoja de vida** (`/portal/resume`, `ResumeView`): se ve como documento con `ResumeSheet`; "Editar" abre el formulario con la vista previa al lado, que cambia mientras se escribe. Descargar datos y borrar cuenta quedan como enlaces al pie. En el inicio, la hoja de vida se ve a la derecha, junto a las postulaciones.
- **Sin "lo que ve la IA"** ni frases sobre la IA en el portal; las etapas y estados son texto con color (sin pastillas).
- **Botón tinta en oscuro**: su hover ya no se vuelve un panel oscuro con texto oscuro (afectaba también a la app de empresa).
- `routes.portalProfile` pasó a `routes.portalResume`; `/portal/applications` (lista) se quitó: el inicio es la lista.
- **pen.dev**: el tablero "MVP · Postulante" ahora es oscuro y tiene las pantallas nuevas.


## 37 · `feat/portal-theme` (PDF y tema del postulante)

- **Tema**: el portal y las páginas públicas siguen el interruptor (`ThemeToggle` en sus barras). `.portal-light` pone base cálida en claro (`--portal-base`), luces y una textura de **contornos** SVG (`--contours`) que deriva despacio. Nada de ruido ni cuadrícula.
- **Lector de PDF** (`shared/components/pdf/pdf-viewer.tsx`, pdf.js 4.10): miniaturas, zoom, página actual, descarga y zonas clicables (`hotspots`). El worker vive en `public/pdf.worker.min.mjs` (copiado de `pdfjs-dist`; actualizarlo si sube la versión) y el proxy excluye `.mjs`.
- **Hoja de vida en PDF** (`shared/lib/resume-pdf.ts`, pdf-lib): genera un A4 desde `ResumeDoc`, con resaltados en ámbar, y devuelve la caja de cada línea. El portal (`ResumeView`) tiene tres herramientas: Ver, Editar texto (tocar una línea del PDF y editarla en el panel; el PDF se regenera) y Resaltar. Panel con a qué postulaciones llega y versiones.
- **Empresa**: en el ranking, "Hoja de vida" abre "PDF original" (líneas que prueban requisitos resaltadas) o "Revisión de Criba"; en Postulaciones, el nombre de un PDF o Word leído abre el lector. Mientras no exista Storage, el PDF se genera con datos de ejemplo.
- **Entrada del postulante** (`/portal/sign-in`): pantalla partida con panel ámbar donde una postulación avanza sola por sus etapas.
- Con backend: servir el archivo real desde el bucket `cvs` (URL firmada) al lector, y guardar las ediciones como nueva versión del CV.


## 38 y 39 · Paneles, Criba AI y pen.dev 1:1

- **`.panel`**: tarjeta translúcida con desenfoque para el lado del candidato; el texto se lee y la textura se sigue viendo.
- **Textura de empresa** (`.org-light` en `app/(dashboard)/layout.tsx`): arcos concéntricos que barren desde arriba a la derecha (`--rings`), hermana de los contornos del postulante.
- **Inicio de empresa**: el filtro general mueve las cifras y es el punto de partida; el embudo (período y vacante), el resultado por vacante (período y orden) y los mejores perfiles (vacante y cantidad) tienen su propio filtro.
- **Criba AI** (`shared/components/ui/criba-ai.tsx`: `CribaAi`, `CribaAiNote`, color `--ai-ink`): marca dónde actúa la IA, sin tono de advertencia. Empresa: embudo, resultado por vacante, mejores perfiles, KPIs de entrevistas y horas, tablero de postulaciones, modal Evaluar, evaluando, ranking y su evidencia, "Proponer requisitos con Criba AI", entrevistas y gobierno. Postulante: lo que encontró en la hoja de vida, "Vacantes para ti" (con el porqué y afinidad Muy afín / Afín / Podría servirte, nunca puntaje), orden de vacantes, perfil deducido de la vacante y la entrevista.
- **Recomendaciones** (`features/candidates/api/portal.ts`): `skills` de la hoja de vida y `match` por vacante (palabras clave en el mock; con backend, embeddings de requisitos y fragmentos). Hay vacantes de otras empresas ficticias en `other-companies.ts`, también con página pública.
- **Tarjeta de hoja de vida** del inicio (`CvCard`): miniatura real del PDF (`PdfFirstPage`), archivo y habilidades encontradas.
- **pen.dev rehecho 1:1**: se borró todo y se importaron 40 frames desde la app (pantallas de empresa y postulante, modo oscuro y modales) en seis tableros. Método: cada pantalla se congela en HTML estático con Playwright (los canvas de PDF pasan a imagen), la app lo sirve temporalmente y el navegador de pen.dev lo importa como capas editables. Las texturas van como imagen (`tex-*.png` junto al `.pen`). Las fuentes llegan con su nombre real (Funnel Display, Funnel Sans, IBM Plex Mono).

## Landing (repo aparte `ai_talent_landing`)

Rama `feat/two-sided` sobre `feat/landing`: la landing le habla a empresas y a personas que buscan empleo. Selector de rol en el hero, sección "Para los dos lados" en lugar de la criba que cerraba filas, vacantes abiertas con "Postularme", cierre con una acción por rol y una órbita 3D con hojas de vida (sin nombres) alrededor de una vacante genérica: las más cercanas al centro brillan en ámbar porque encajan mejor, tipografía Funnel y el logo nuevo. Los enlaces de candidato van a la vacante pública de la app (`/jobs/{id}`), ver la sección 29. Rama `feat/responsive` encima: menú de celular en la navbar y hero, tarjetas y bandeja que caben en 360 px.

Astro 7 + Tailwind v4, estática y en oscuro (tinta verde de la marca, resaltador ámbar; nada espacial). Repo git **local** (sin remoto todavía): `main` tiene el andamiaje y `feat/landing` todo lo demás. Hay que crear el repo en GitHub y empujar ambas ramas. Detalle en su `README.md`.

- **Hero**: titular con palabra que rota bajo el resaltador y una hoja de vida que se revisa sola (resaltador, notas al margen con puntos, sello final); las demás hojas se abren en abanico con el scroll.
- **Fuentes**: sección fija; al bajar se enciende cada plataforma (LinkedIn, Computrabajo, elempleo, Indeed, Greenhouse, Drive, Gmail) y suelta una hoja que cae en la bandeja de Criba.
- **La criba** (idea central): lista de postulantes que pasa tres filtros con el scroll; se ilumina la columna evaluada y las filas que no pasan se cierran.
- **Cómo evalúa** (tres demos vivas), **Gobierno de IA** (franja breve) y **cierre** con un tamiz en perspectiva que gira en reposo y criba granos.
- Sin precios ni "50 hojas gratis": no venían de ningún requisito.
- `pnpm dev` → `http://localhost:4321`. `PUBLIC_APP_URL` apunta a la app Next.

## Pendiente

- Conectar las `api/` de cada feature a los endpoints reales cuando existan (cada función indica su ruta en el comentario).
- Anon key de Supabase en `.env.local` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`); hoy está vacía y la app corre en modo mock.
- Proveedores OAuth en `supabase/config.toml` si se quieren los botones Google / Microsoft.
- Tests: el CI corre `pnpm test --if-present` y aún no hay runner configurado.

## Convenciones

- Commits atómicos, en inglés, ≤ 70 caracteres, tipo `feat: …` / `fix: …` / `chore: …`, sin paréntesis ni coautoría.
- Una feature no importa de otra feature; lo común sube a `shared/`.
- Mientras no haya backend: `NEXT_PUBLIC_USE_MOCKS=true` en `.env.local` y las `api/` de cada feature devuelven datos de `src/shared/mocks`.
