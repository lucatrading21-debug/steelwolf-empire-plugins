#!/usr/bin/env node
/* Verifica che la copia installata corrisponda ESATTAMENTE al manifesto: nessun file mancante,
 * nessuno estraneo, nessuno alterato. uso: node verify-manifest.mjs --dir=<cartella session installata> */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const A = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const DIR = A("dir", dirname(fileURLToPath(import.meta.url)));
const MAN = join(DIR, "MANIFEST.json");
if (!existsSync(MAN)) { console.error(`STOP: manifesto assente in ${DIR}`); process.exit(2); }
const man = JSON.parse(readFileSync(MAN, "utf8"));
const walk = (d, acc = []) => { for (const n of readdirSync(d)) { const p = join(d, n);
  statSync(p).isDirectory() ? walk(p, acc) : acc.push(relative(DIR, p).split("\\").join("/")); } return acc; };
const found = walk(DIR).filter(f => f !== "MANIFEST.json").sort();
const want = Object.keys(man.files).sort();
const miss = want.filter(f => !found.includes(f));
const extra = found.filter(f => !want.includes(f));
const alt = want.filter(f => found.includes(f) &&
  createHash("sha256").update(readFileSync(join(DIR, f))).digest("hex") !== man.files[f]);
const bad = [];
if (miss.length) bad.push(`MANCANTI (${miss.length}): ${miss.join(", ")}`);
if (extra.length) bad.push(`ESTRANEI (${extra.length}): ${extra.join(", ")}`);
if (alt.length) bad.push(`ALTERATI (${alt.length}): ${alt.join(", ")}`);
if (bad.length) { console.error("MANIFEST: STOP\n" + bad.map(b => "  · " + b).join("\n")); process.exit(2); }
console.log(`MANIFEST: PASS — ${want.length} file, nessun mancante, nessun estraneo, nessun alterato`);
/* elenco per lo staging: l'atteso viene DA QUI, non da cio' che risulta staged */
if (A("print-paths", null) !== null) for (const f of want) console.log(f);
process.exit(0);
