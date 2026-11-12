/** Clave del tema elegido en localStorage ("dark" o "light"). */
export const THEME_KEY = "criba.theme";

/** Script que aplica el tema guardado antes del primer pintado (sin parpadeo). */
export const themeScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;
