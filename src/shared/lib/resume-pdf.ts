import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { ResumeDoc } from "@/shared/types/resume-doc";

/**
 * Convierte una hoja de vida en un PDF real con el formato de la plantilla Harvard: A4, serif,
 * nombre centrado, secciones en mayúsculas con una línea debajo, cargo en negrita con las fechas
 * a la derecha, empleador en cursiva y logros en viñetas. Devuelve los bytes y dónde quedó cada
 * línea, para que el visor pueda volverlas clicables (editar, resaltar).
 */

export interface PdfLineBox {
  /** "head:name", "head:headline", "head:contact" o "s{sección}-l{línea}". */
  key: string;
  page: number;
  /** En puntos PDF, origen arriba a la izquierda. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ResumePdf {
  bytes: Uint8Array;
  boxes: PdfLineBox[];
  pageSize: { width: number; height: number };
}

const A4 = { width: 595.28, height: 841.89 };
const M = 54;
const INK = rgb(0.1, 0.13, 0.11);
const INK2 = rgb(0.29, 0.32, 0.3);
const INK3 = rgb(0.5, 0.52, 0.49);
const AMBER = rgb(0.95, 0.66, 0.23);

/** `firstMax`: ancho de la primera línea cuando parte del renglón ya está ocupado (una etiqueta). */
function wrap(text: string, font: PDFFont, size: number, max: number, firstMax = max): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > (lines.length ? max : firstMax) && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

/** Las fuentes estándar del PDF solo traen WinAnsi: otro carácter haría fallar el documento entero. */
const REPLACEMENTS: Record<string, string> = { "→": "->", "←": "<-", "≥": ">=", "≤": "<=", "✓": "-", "●": "•", "▪": "•", "■": "•", "◦": "•", "‑": "-", "−": "-", "\u00a0": " ", "\u2009": " ", "\u202f": " ", "\t": " " };

function sanitizer(font: PDFFont): (text: string) => string {
  const supported = new Set(font.getCharacterSet());
  return (text) =>
    Array.from(text.normalize("NFC"))
      .map((char) => REPLACEMENTS[char] ?? (supported.has(char.codePointAt(0) ?? 0) ? char : /\s/.test(char) ? " " : ""))
      .join("");
}

/** "Técnicas: C++, SQL" → la etiqueta va en negrita, como el bloque final de la plantilla Harvard. */
const LABELED = /^([^:]{2,24}):\s+(.+)$/;

export async function resumeToPdf(source: ResumeDoc, highlights: Set<string> = new Set()): Promise<ResumePdf> {
  const pdf = await PDFDocument.create();
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const clean = sanitizer(serif);
  const doc: ResumeDoc = {
    ...source,
    name: clean(source.name),
    headline: clean(source.headline),
    contact: source.contact.map(clean),
    sections: source.sections.map((sec) => ({ title: clean(sec.title), lines: sec.lines.map((line) => ({ ...line, text: clean(line.text), right: line.right ? clean(line.right) : line.right })) })),
  };
  pdf.setTitle(`Hoja de vida, ${doc.name}`);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const boxes: PdfLineBox[] = [];
  const width = A4.width - M * 2;

  let page: PDFPage = pdf.addPage([A4.width, A4.height]);
  let pageIndex = 0;
  let y = M; // distancia desde arriba

  const ensure = (h: number) => {
    if (y + h > A4.height - M) {
      page = pdf.addPage([A4.width, A4.height]);
      pageIndex++;
      y = M;
    }
  };
  /** Dibuja texto con la línea base a `top + size` y registra su caja. */
  const draw = (key: string, text: string, x: number, size: number, font: PDFFont, color = INK, w?: number) => {
    const tw = w ?? font.widthOfTextAtSize(text, size);
    if (highlights.has(key)) page.drawRectangle({ x: x - 2, y: A4.height - y - size * 1.05, width: tw + 4, height: size * 1.2, color: AMBER, opacity: 0.45 });
    page.drawText(text, { x, y: A4.height - y - size * 0.82, size, font, color });
  };
  const centered = (key: string, text: string, size: number, font: PDFFont, color = INK) => {
    const tw = font.widthOfTextAtSize(text, size);
    const x = (A4.width - tw) / 2;
    ensure(size * 1.4);
    draw(key, text, x, size, font, color, tw);
    boxes.push({ key, page: pageIndex, x: x - 4, y: y - 2, w: tw + 8, h: size * 1.25 });
    y += size * 1.4;
  };

  centered("head:name", doc.name || "Tu nombre", 21, bold);
  centered("head:headline", doc.headline || "Cargo o título", 11.5, italic, INK2);
  centered("head:contact", doc.contact.filter(Boolean).join("     ") || "Correo · celular · ciudad", 9, serif, INK3);
  y += 10;

  doc.sections.forEach((sec, si) => {
    // El título de una sección no se queda solo al final de la página: baja con sus primeras líneas.
    ensure(72);
    y += 6;
    page.drawText(sec.title.toUpperCase(), { x: M, y: A4.height - y - 9, size: 10.5, font: bold, color: INK });
    y += 13;
    page.drawLine({ start: { x: M, y: A4.height - y }, end: { x: A4.width - M, y: A4.height - y }, thickness: 0.8, color: INK });
    y += 7;
    const labeled = /^habilidades/i.test(sec.title);

    sec.lines.forEach((line, li) => {
      const key = `s${si}-l${li}`;
      const top = y;
      if (line.kind === "role") {
        if (li > 0) y += 4;
        // El cargo no se queda solo al final de la página: baja con su primera línea.
        ensure(34);
        const roleTop = y;
        const right = line.right ?? "";
        const rw = serif.widthOfTextAtSize(right, 10.5);
        const text = line.text || "Cargo o estudio";
        // Un cargo largo baja de renglón en vez de pisar las fechas.
        const titleLines = wrap(text, bold, 11, width - (right ? rw + 16 : 0));
        if (right) page.drawText(right, { x: A4.width - M - rw, y: A4.height - y - 9, size: 10.5, font: serif, color: INK2 });
        titleLines.forEach((l) => {
          draw(key, l, M, 11, bold, INK);
          y += 15;
        });
        y += 1;
        boxes.push({ key, page: pageIndex, x: M - 4, y: roleTop - 3, w: width + 8, h: titleLines.length * 15 + 2 });
        return;
      }
      if (line.kind === "sub") {
        ensure(15);
        draw(key, line.text || "Empresa", M, 10.5, italic, INK2);
        y += 15;
        boxes.push({ key, page: pageIndex, x: M - 4, y: top - 3, w: width + 8, h: 16 });
        return;
      }
      const indent = line.kind === "bullet" ? 14 : 0;
      const size = 10.5;
      const match = labeled && line.kind === "text" ? LABELED.exec(line.text) : null;
      const label = match ? `${match[1]}: ` : "";
      const labelWidth = label ? bold.widthOfTextAtSize(label, size) : 0;
      const lines = wrap((match ? match[2] : line.text) || "Escribe aquí", serif, size, width - indent, width - indent - labelWidth - 1.5);
      // Un párrafo corto no se parte entre páginas; uno largo sigue en la siguiente.
      ensure(Math.min(lines.length, 4) * 14);
      const startPage = pageIndex;
      const startY = y;
      if (line.kind === "bullet") page.drawText("•", { x: M + 3, y: A4.height - y - size * 0.82, size, font: serif, color: INK2 });
      // Todas las líneas del párrafo comparten la clave: el resaltado cubre el párrafo entero.
      lines.forEach((l, index) => {
        ensure(14);
        if (index === 0 && label) page.drawText(label, { x: M, y: A4.height - y - size * 0.82, size, font: bold, color: INK });
        draw(key, l, M + indent + (index === 0 ? labelWidth + 1.5 : 0), size, serif, line.kind === "bullet" ? INK2 : INK);
        y += 14;
      });
      boxes.push({ key, page: startPage, x: M + indent - 4, y: startY - 3, w: width - indent + 8, h: lines.length * 14 + 2 });
      y += 2;
    });
    y += 6;
  });

  return { bytes: await pdf.save(), boxes, pageSize: A4 };
}
