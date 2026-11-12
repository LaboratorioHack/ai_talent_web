/**
 * Movimiento de la landing, sin dependencias. Cuatro mecanismos genéricos que
 * los componentes usan con atributos:
 *
 *  data-reveal                 aparece al entrar en pantalla (style="--i:n" escalona)
 *  data-loop="pasos" data-ms   escena en bucle: los hijos con data-at="k" reciben .is-on
 *                              cuando el paso ≥ k (data-until="k" lo apaga desde k)
 *  data-scroll                 progreso de 0 a 1 del scroll en --p (y en data-p), para CSS
 *  data-count="1284"           contador que sube cuando se ve
 *  data-rotate                 rota sus hijos [data-word] cada data-ms
 *
 * Todo lo que corre en bucle se detiene fuera de pantalla (data-offscreen).
 */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

/* ---------- Visibilidad compartida ---------- */
const visibility = new WeakMap<Element, boolean>();
const onVisible = new WeakMap<Element, (v: boolean) => void>();
const seen = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      visibility.set(e.target, e.isIntersecting);
      e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
      onVisible.get(e.target)?.(e.isIntersecting);
    }
  },
  { rootMargin: "120px 0px" },
);
function watch(el: Element, cb?: (v: boolean) => void) {
  if (cb) onVisible.set(el, cb);
  seen.observe(el);
}

/* ---------- Revelado ---------- */
const revealer = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-visible");
      revealer.unobserve(e.target);
    }
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
);
document.querySelectorAll("[data-reveal]").forEach((el) => revealer.observe(el));

/* ---------- Contadores ---------- */
export function countTo(el: HTMLElement, to: number, ms = 1400) {
  const decimals = Number(el.dataset.decimals ?? 0);
  const suffix = el.dataset.suffix ?? "";
  const fmt = (n: number) => n.toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  if (reduced) {
    el.textContent = fmt(to);
    return;
  }
  const from = Number(el.dataset.value ?? 0);
  const start = performance.now();
  const tick = (now: number) => {
    const t = clamp((now - start) / ms);
    const v = from + (to - from) * easeOut(t);
    el.textContent = fmt(v);
    if (t < 1) requestAnimationFrame(tick);
    else el.dataset.value = String(to);
  };
  requestAnimationFrame(tick);
}
const counter = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      countTo(el, Number(el.dataset.count), 1800);
      counter.unobserve(el);
    }
  },
  { threshold: 0.6 },
);
document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => counter.observe(el));

/* ---------- Escenas en bucle ---------- */
function setupLoop(root: HTMLElement) {
  const steps = Number(root.dataset.loop);
  const ms = Number(root.dataset.ms ?? 1800);
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-at]"));
  const counters = Array.from(root.querySelectorAll<HTMLElement>("[data-count-at]"));
  let step = -1;
  let timer = 0;

  const render = () => {
    root.dataset.step = String(step);
    for (const n of nodes) {
      const at = Number(n.dataset.at);
      const until = n.dataset.until !== undefined ? Number(n.dataset.until) : Infinity;
      n.classList.toggle("is-on", step >= at && step < until);
    }
    for (const c of counters) {
      const at = Number(c.dataset.countAt);
      const to = Number(c.dataset.to);
      if (step === at) countTo(c, to, Number(c.dataset.countMs ?? 900));
      if (step < at && c.dataset.value !== "0") {
        c.dataset.value = "0";
        c.textContent = "0" + (c.dataset.suffix ?? "");
      }
    }
  };

  const next = () => {
    step = (step + 1) % steps;
    render();
    const hold = Number(root.querySelector<HTMLElement>(`[data-hold="${step}"]`)?.dataset.holdMs ?? 0);
    timer = window.setTimeout(next, ms + hold);
  };

  if (reduced) {
    step = steps - 1;
    render();
    return;
  }

  watch(root, (visible) => {
    window.clearTimeout(timer);
    if (visible) timer = window.setTimeout(next, step < 0 ? 300 : ms);
  });
}
document.querySelectorAll<HTMLElement>("[data-loop]").forEach(setupLoop);

/* ---------- Palabras que rotan ---------- */
function setupRotator(root: HTMLElement) {
  const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
  const ms = Number(root.dataset.ms ?? 2400);
  let i = 0;
  let timer = 0;
  const paint = () =>
    words.forEach((w, j) => {
      w.dataset.state = j === i ? "on" : j === (i + words.length - 1) % words.length ? "out" : "in";
    });
  paint();
  if (reduced) return;
  watch(root, (visible) => {
    window.clearInterval(timer);
    if (visible)
      timer = window.setInterval(() => {
        i = (i + 1) % words.length;
        paint();
      }, ms);
  });
}
document.querySelectorAll<HTMLElement>("[data-rotate]").forEach(setupRotator);

/* ---------- Progreso de scroll ---------- */
/*
 * data-scroll="enter"  0 cuando el borde superior toca el fondo de la ventana,
 *                      1 cuando llega a data-end (fracción de la ventana, 0.35 por defecto).
 * data-scroll="through" 0 al entrar, 1 al salir por arriba: para secciones fijas (sticky).
 */
const scrubbed = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll]"));
let frame = 0;
function scrub() {
  frame = 0;
  const vh = window.innerHeight;
  for (const el of scrubbed) {
    if (visibility.get(el) === false) continue;
    const r = el.getBoundingClientRect();
    let p: number;
    if (el.dataset.scroll === "through") {
      p = clamp(-r.top / Math.max(1, r.height - vh));
    } else {
      const end = Number(el.dataset.end ?? 0.35) * vh;
      p = clamp((vh - r.top) / Math.max(1, vh - end));
    }
    if (reduced) p = 1;
    el.style.setProperty("--p", p.toFixed(4));
    el.dataset.p = p.toFixed(2);
    el.dispatchEvent(new CustomEvent("scroll-progress", { detail: p }));
  }
}
scrubbed.forEach((el) => watch(el));
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(scrub);
};
window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", schedule);
scrub();

/* ---------- Barra de navegación ---------- */
const nav = document.getElementById("nav");
const syncNav = () => nav?.toggleAttribute("data-scrolled", window.scrollY > 12);
syncNav();
window.addEventListener("scroll", syncNav, { passive: true });

/* ---------- Etapas por scroll (la criba) ---------- */
/*
 * data-stages="N" junto a data-scroll="through": reparte el progreso en N
 * etapas. Hijos:
 *   data-stage-at="k"    .is-current si etapa == k, .is-past si etapa > k
 *   data-stage-only="k"  .is-current solo en la etapa k
 *   data-out="k" (k>0)   .is-out cuando etapa >= k
 *   .keeper              .is-final en la última etapa
 * Además pone --sweep (de 0 a 1 dentro de la etapa) para la línea que barre.
 */
document.querySelectorAll<HTMLElement>("[data-stages]").forEach((root) => {
  const n = Number(root.dataset.stages);
  const at = Array.from(root.querySelectorAll<HTMLElement>("[data-stage-at]"));
  const only = Array.from(root.querySelectorAll<HTMLElement>("[data-stage-only]"));
  const outs = Array.from(root.querySelectorAll<HTMLElement>("[data-out]"));
  const keepers = Array.from(root.querySelectorAll<HTMLElement>(".keeper"));
  let last = -1;
  const apply = (p: number) => {
    // Un respiro al principio y al final para que la primera y la última etapa se lean.
    const t = clamp((p - 0.06) / 0.88);
    const stage = Math.min(n - 1, Math.floor(t * n));
    root.style.setProperty("--sweep", ((t * n) % 1).toFixed(3));
    if (stage === last) return;
    last = stage;
    root.dataset.stage = String(stage);
    at.forEach((el) => {
      const k = Number(el.dataset.stageAt);
      el.classList.toggle("is-current", stage === k);
      el.classList.toggle("is-past", stage > k);
    });
    only.forEach((el) => el.classList.toggle("is-current", Number(el.dataset.stageOnly) === stage));
    outs.forEach((el) => {
      const k = Number(el.dataset.out);
      el.classList.toggle("is-out", k > 0 && stage >= k);
    });
    keepers.forEach((el) => el.classList.toggle("is-final", stage === n - 1));
  };
  root.addEventListener("scroll-progress", (e) => apply((e as CustomEvent<number>).detail));
  apply(reduced ? 1 : 0);
});
