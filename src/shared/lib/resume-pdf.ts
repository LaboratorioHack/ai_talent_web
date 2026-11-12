import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { ResumeDoc } from "@/shared/types/resume-doc";

/**
 * Convierte una hoja de vida en un PDF real (A4, serif de documento, secciones
 * en versalitas). Devuelve los bytes y dónde quedó cada línea, para que el
 * visor pueda volverlas clicables (editar, resaltar).
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

function wrap(text: string, font: PDFFont, size: number, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

export async function resumeToPdf(doc: ResumeDoc, highlights: Set<string> = new Set()): Promise<ResumePdf> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Hoja de vida, ${doc.name}`);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
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
    ensure(40);
    y += 6;
    const title = sec.title.toUpperCase().split("").join(" ");
    page.drawText(title, { x: M, y: A4.height - y - 8, size: 8.5, font: bold, color: INK });
    y += 13;
    page.drawLine({ start: { x: M, y: A4.height - y }, end: { x: A4.width - M, y: A4.height - y }, thickness: 0.6, color: INK3 });
    y += 8;

    sec.lines.forEach((line, li) => {
      const key = `s${si}-l${li}`;
      const top = y;
      if (line.kind === "role") {
        ensure(18);
        const right = line.right ?? "";
        const rw = italic.widthOfTextAtSize(right, 10);
        const text = line.text || "Cargo o estudio";
        draw(key, text, M, 11, bold, INK, Math.min(bold.widthOfTextAtSize(text, 11), width - rw - 16));
        if (right) page.drawText(right, { x: A4.width - M - rw, y: A4.height - y - 9, size: 10, font: italic, color: INK3 });
        y += 16;
        boxes.push({ key, page: pageIndex, x: M - 4, y: top - 3, w: width + 8, h: 17 });
        return;
      }
      const indent = line.kind === "bullet" ? 14 : 0;
      const size = 10.5;
      const lines = wrap(line.text || "Escribe aquí", serif, size, width - indent);
      ensure(lines.length * 14);
      const startPage = pageIndex;
      const startY = y;
      if (line.kind === "bullet") page.drawText("•", { x: M + 3, y: A4.height - y - size * 0.82, size, font: serif, color: INK2 });
      // Todas las líneas del párrafo comparten la clave: el resaltado cubre el párrafo entero.
      lines.forEach((l) => {
        draw(key, l, M + indent, size, serif, line.kind === "bullet" ? INK2 : INK);
        y += 14;
      });
      boxes.push({ key, page: startPage, x: M + indent - 4, y: startY - 3, w: width - indent + 8, h: lines.length * 14 + 2 });
      y += 2;
    });
    y += 6;
  });

  return { bytes: await pdf.save(), boxes, pageSize: A4 };
}
