// Legge readNext() dal session-gate indicato e la applica a ogni testo di un file JSON (array di stringhe).
// uso: node read_next.mjs <session-gate.mjs> <casi.json>   -> stampa un array JSON di risultati
// (c) 2026 Luke SteelWolf. Strumento di verifica S215 (L9.17), non fa parte del payload del plugin.
import { readFileSync } from "node:fs";
const src = readFileSync(process.argv[2], "utf8");
const a = src.indexOf("function shapeOf"), b = src.indexOf("const die =");
if (a < 0 || b < a) { console.error("readNext/shapeOf non trovati nel gate"); process.exit(3); }
const readNext = new Function(src.slice(a, b) + "; return readNext;")();
const cases = JSON.parse(readFileSync(process.argv[3], "utf8"));
/* come il gate in close: il BOM iniziale (PS 5.1 -Encoding UTF8) si toglie prima di leggere */
console.log(JSON.stringify(cases.map(c => readNext(c.replace(/^\uFEFF/, "")))));
