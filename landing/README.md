# Criba · Landing

Landing pública de AI Talent Scout ("Criba"), para empresas que contratan y para personas que buscan empleo, en Astro 7 + Tailwind v4. Página estática, sin framework de UI en el cliente: el movimiento es CSS más un script pequeño en `src/scripts/motion.ts`.

```bash
pnpm install
cp .env.example .env   # PUBLIC_APP_URL apunta a la app Next (Entrar / Empezar gratis)
pnpm dev               # http://localhost:4321
pnpm check && pnpm build
```

## Estructura

```
src/
  layouts/Base.astro        <head>, fuentes y el fondo
  components/
    Mesh.astro              fondo: grano de papel + malla de puntos con paralaje
    Nav.astro               barra que se compacta y gana fondo al hacer scroll
    Hero.astro              titular con palabra que rota bajo el resaltador + ReviewedSheet
    ReviewedSheet.astro     hoja de vida en papel (.paper) que se revisa sola: resaltador, notas, sello
    Sieve.astro             la criba: lista de postulantes que pasa tres filtros con el scroll
    HowItWorks.astro        tres pasos con demos vivas (formatos, pesos, cita del CV)
    SieveIdle.astro         tamiz en perspectiva que gira en reposo y criba granos
    FinalCta.astro          cierre con SieveIdle + pie
  scripts/motion.ts         revelado, bucles, progreso de scroll, etapas y contadores
  styles/global.css         tokens (oscuro), resaltador y animaciones
```

## Identidad

Oscuro, con la tinta verde de la marca como fondo y el ámbar como única luz: el resaltador sobre la evidencia. Nada espacial (sin estrellas, nebulosas ni órbitas). La idea central es el filtro: de todas las postulaciones a las pocas que vale la pena entrevistar. Los tokens son semánticos (`paper` = fondo, `surface` = tarjeta, `ink` = texto), así que cambiar de tema es cambiar valores en `:root`.

## Movimiento

Atributos que lee `scripts/motion.ts`:

- `data-reveal` aparece al entrar en pantalla; `style="--i:n"` escalona.
- `data-loop="N" data-ms="1500"` reproduce una escena en bucle: los hijos con `data-at="k"` reciben `.is-on` desde el paso k (`data-until` lo apaga).
- `data-scroll` publica el progreso de scroll en `--p` para usarlo en CSS; con `="through"` sirve para secciones fijas.
- `data-stages="N"` reparte ese progreso en etapas: hijos con `data-stage-at`, `data-stage-only`, `data-out` y `.keeper` (la criba).
- `.paper` redefine los tokens en claro dentro de un elemento: hojas de papel sobre el fondo oscuro.
- `data-count` anima un contador; `data-rotate` rota palabras.

Lo que corre en bucle se pausa fuera de pantalla, y todo respeta `prefers-reduced-motion`.

## Despliegue

Vive dentro de `ai_talent_web` y se despliega con su CD: el `Dockerfile` de la app construye la landing (etapa `landing`, `base: /landing`) y la copia a `public/landing`.

| Dominio | Qué sirve |
|---|---|
| `https://criba.isroot.in` | La landing: Caddy sirve `/` con `/landing/index.html`; cualquier otra ruta redirige a la app |
| `https://app.criba.isroot.in` | La app Next y la API (`/api`) |

Los botones van a `LANDING_APP_URL` (por defecto `https://app.criba.isroot.in`) y las URLs canónicas usan `LANDING_SITE_URL` (`https://criba.isroot.in`). En desarrollo: `pnpm install && pnpm dev` dentro de `landing/`.
