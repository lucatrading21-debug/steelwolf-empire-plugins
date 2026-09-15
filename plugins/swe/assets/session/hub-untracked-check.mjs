#!/usr/bin/env node
/* Preflight HUB: l'Hub conserva untracked DELIBERATI. Non si pretende un albero vuoto e non si
 * cancella nulla: si confronta l'inventario FRESCO con una baseline revisionata.
 * STOP su: qualunque staged/modified/deleted, o un untracked NUOVO non in baseline.
 * uso: node hub-untracked-check.mjs --repo=<hub> --baseline=<file> [--write-baseline]
 *
 * DUE VISTE (S204). Misurato: lo stesso repo, nello stesso istante, dava 12 untracked su Windows
 * e 13 dalla VM Linux, perche' il profilo Windows ha ~/.config/git/ignore con una regola che
 * nasconde .claude/settings.local.json. Un preflight che eredita le esclusioni personali della
 * macchina non e' confrontabile fra PREDATOR e ACE.
 *   - vista OPERATIVA: git come lo vede l'utente (eredita i suoi ignore globali).
 *   - vista AUDIT    : ignore globali NEUTRALIZZATI con un file di esclusione VUOTO creato qui.
 * La baseline e il confronto usano la vista AUDIT: e' l'unica indipendente dalla macchina.
 * Non si modifica nessuna configurazione personale: si passa -c core.excludesFile per-comando.
 * --no-optional-locks: evita index.lock orfani (misurati piu' volte in S204). */
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const A = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const repo = A("repo"); if (!repo) { console.error("--repo mancante"); process.exit(3); }
const base = A("baseline"); if (!base) { console.error("--baseline mancante"); process.exit(3); }

/* File di esclusione VUOTO, creato e posseduto da questo checker. Mai dentro il repo dell'utente. */
let vuoto;
try { vuoto = join(mkdtempSync(join(tmpdir(), "swe-nogitignore-")), "empty"); writeFileSync(vuoto, ""); }
catch (e) { console.error("impossibile creare il file di esclusione vuoto: " + e.message); process.exit(3); }

function status(neutralizza) {
  const pre = neutralizza ? ["-c", "core.excludesFile=" + vuoto] : [];
  const args = ["--no-optional-locks", ...pre, "-C", repo, "status", "--porcelain", "--untracked-files=all"];
  try { return execFileSync("git", args, { encoding: "utf8" }); }
  catch (e) { console.error("git status fallito: " + e.message); process.exit(2); }
}
const parse = (st) => {
  const lines = st.split(/\r?\n/).filter(Boolean);
  return {
    tracked: lines.filter(l => !l.startsWith("??")),
    untracked: lines.filter(l => l.startsWith("??")).map(l => l.slice(3).trim()).sort(),
  };
};

const audit = parse(status(true));
const oper  = parse(status(false));

/* .git/info/exclude e' locale alla macchina quanto l'ignore globale: se ha regole attive la vista
 * audit non e' pienamente neutra. Non e' un blocco - e' un fatto che va detto. */
let infoExclude = 0;
const ie = join(repo, ".git", "info", "exclude");
if (existsSync(ie)) {
  try { infoExclude = readFileSync(ie, "utf8").split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#")).length; } catch {}
}

if (process.argv.includes("--write-baseline")) {
  writeFileSync(base, audit.untracked.join("\n") + "\n");
  console.log(`BASELINE scritta (vista AUDIT): ${audit.untracked.length} untracked in ${base}`);
  if (infoExclude) console.log(`  nota: .git/info/exclude ha ${infoExclude} regole attive - la baseline le eredita`);
  process.exit(0);
}

const nascosti = audit.untracked.filter(u => !oper.untracked.includes(u));
if (nascosti.length) {
  console.log(`  nota: ${nascosti.length} percorso/i visibile/i solo nella vista AUDIT (nascosti dagli ignore globali di questa macchina):`);
  nascosti.forEach(n => console.log(`        ${n}`));
  console.log(`        su un altro PC senza le stesse regole personali comparirebbero: la parita' V1 non si misura con la vista operativa.`);
}
if (infoExclude) console.log(`  nota: .git/info/exclude ha ${infoExclude} regole attive (locali alla macchina, non versionate)`);

const bad = [];
if (audit.tracked.length) bad.push(`modifiche TRACKED presenti (${audit.tracked.length}):\n      ` + audit.tracked.join("\n      "));
if (!existsSync(base)) bad.push(`baseline assente: ${base}`);
else {
  const known = new Set(readFileSync(base, "utf8").split(/\r?\n/).filter(Boolean));
  const nuovi = audit.untracked.filter(u => !known.has(u));
  const spariti = [...known].filter(k => !audit.untracked.includes(k));
  if (nuovi.length) bad.push(`untracked NUOVI, non in baseline (${nuovi.length}):\n      ` + nuovi.join("\n      "));
  if (spariti.length) console.log(`  nota: ${spariti.length} untracked della baseline non piu presenti (non e' un blocco, nessuna cancellazione fatta da qui)`);
}
if (bad.length) { console.error("HUB PREFLIGHT: STOP\n" + bad.map(b => "  · " + b).join("\n")); process.exit(2); }
console.log(`HUB PREFLIGHT: PASS — 0 tracked, ${audit.untracked.length} untracked tutti in baseline (vista AUDIT; vista operativa: ${oper.untracked.length})`);
process.exit(0);
