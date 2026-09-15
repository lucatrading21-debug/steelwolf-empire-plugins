#!/usr/bin/env node
/* Preflight HUB: l'Hub conserva untracked DELIBERATI. Non si pretende un albero vuoto e non si
 * cancella nulla: si confronta l'inventario FRESCO con una baseline revisionata.
 * STOP su: qualunque staged/modified/deleted, o un untracked NUOVO non in baseline.
 * uso: node hub-untracked-check.mjs --repo=<hub> --baseline=<file> [--write-baseline] */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const A = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const repo = A("repo"); if (!repo) { console.error("--repo mancante"); process.exit(3); }
const base = A("baseline"); if (!base) { console.error("--baseline mancante"); process.exit(3); }
let st; try { st = execFileSync("git", ["-C", repo, "status", "--porcelain", "--untracked-files=all"], { encoding: "utf8" }); }
catch (e) { console.error("git status fallito: " + e.message); process.exit(2); }
const lines = st.split(/\r?\n/).filter(Boolean);
const tracked = lines.filter(l => !l.startsWith("??"));
const untracked = lines.filter(l => l.startsWith("??")).map(l => l.slice(3).trim()).sort();
if (process.argv.includes("--write-baseline")) {
  writeFileSync(base, untracked.join("\n") + "\n");
  console.log(`BASELINE scritta: ${untracked.length} untracked in ${base}`); process.exit(0);
}
const bad = [];
if (tracked.length) bad.push(`modifiche TRACKED presenti (${tracked.length}):\n      ` + tracked.join("\n      "));
if (!existsSync(base)) bad.push(`baseline assente: ${base}`);
else {
  const known = new Set(readFileSync(base, "utf8").split(/\r?\n/).filter(Boolean));
  const nuovi = untracked.filter(u => !known.has(u));
  const spariti = [...known].filter(k => !untracked.includes(k));
  if (nuovi.length) bad.push(`untracked NUOVI, non in baseline (${nuovi.length}):\n      ` + nuovi.join("\n      "));
  if (spariti.length) console.log(`  nota: ${spariti.length} untracked della baseline non piu presenti (non e' un blocco, nessuna cancellazione fatta da qui)`);
}
if (bad.length) { console.error("HUB PREFLIGHT: STOP\n" + bad.map(b => "  · " + b).join("\n")); process.exit(2); }
console.log(`HUB PREFLIGHT: PASS — 0 tracked, ${untracked.length} untracked tutti in baseline (conservati, mai toccati)`);
process.exit(0);
