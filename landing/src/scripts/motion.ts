/**
 * Movimiento de la landing, a propósito poco:
 *  data-reveal   aparece al entrar en pantalla (style="--i:n" escalona)
 *  #nav          recibe data-scrolled al bajar, para mostrar su fondo
 */
const reveal = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-visible");
      reveal.unobserve(e.target);
    }
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
);
document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

const nav = document.getElementById("nav");
const syncNav = () => nav?.toggleAttribute("data-scrolled", window.scrollY > 8);
syncNav();
window.addEventListener("scroll", syncNav, { passive: true });

/*
 * data-scrub: progreso de 0 a 1 en --p según el scroll, sin fijar la página.
 * 0 cuando el borde superior entra por abajo; 1 cuando llega a data-scrub-end
 * (fracción de la ventana desde arriba, 0.35 por defecto). Va y vuelve con el scroll.
 */
const scrubbed = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]"));
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (scrubbed.length && !still) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of scrubbed) {
      const end = Number(el.dataset.scrubEnd ?? 0.35);
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh - top) / (vh * (1 - end))));
      el.style.setProperty("--p", p.toFixed(3));
    }
  };
  const schedule = () => (raf ||= requestAnimationFrame(update));
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}

/* Los bucles (la órbita del cierre) se pausan fuera de pantalla. */
const pauser = new IntersectionObserver((entries) => {
  for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
});
document.querySelectorAll(".orbit").forEach((el) => pauser.observe(el));
