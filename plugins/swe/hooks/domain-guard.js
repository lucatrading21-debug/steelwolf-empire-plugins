#!/usr/bin/env node
/* SteelWolf Empire - swe guard (UserPromptSubmit).
 *
 * INVARIANTE OWNER (S189, ADR-027 §4): ogni progetto SteelWolf possiede la propria scrivania e la
 * propria catena di sessioni. Una scrivania puo' aprire, ciclare e chiudere ESCLUSIVAMENTE sessioni
 * del progetto che rappresenta. Nessuna scrivania opera sessioni di un altro progetto.
 * L'Hub NON e' un lanciatore: la scrivania `SteelWolf_Empire` apre solo `predator`.
 *
 * REGOLA DI FALLIMENTO (S189, decisione owner):
 *   - identita' del progetto = FAIL-CLOSED. Se non si stabilisce il progetto, o due segnali si
 *     contraddicono -> STOP (exit 2). Mai "non riconosco, allora assumo predator".
 *   - la degradazione ammessa riguarda SOLO il livello di rendering (L1 -> L2), a valle, e non e'
 *     competenza di questo hook.
 *
 * SORGENTE DI VERITA': hub/steelwolf-empire-hub/_status/_PROJECTS_INDEX.yaml (campi slug, desk_mount,
 * swe_writes). Nessuna mappa hardcoded: in S189 quella mappa non conteneva `steelwolf-strategy-lab`,
 * quindi dalla scrivania del Lab il guard cadeva in fail-open e lasciava aprire qualsiasi progetto.
 *
 * Cowork (CLAUDE_CODE_IS_COWORK==="1"): niente stdin -> exit 0 no-op. Limite noto, CARD-06B.
 * CLI: legge JSON stdin (`prompt`, `cwd`) -> su violazione exit 2 (rifiuta ed erase il prompt).
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
const fs = require("fs");
const path = require("path");

function deny(msg) { process.stderr.write(msg + "\n"); process.exit(2); }

function findIndex(startDir) {
  const REL = path.join("hub", "steelwolf-empire-hub", "_status", "_PROJECTS_INDEX.yaml");
  let d = startDir;
  for (let i = 0; i < 12 && d; i++) {
    const cand = path.join(d, REL);
    try { if (fs.statSync(cand).isFile()) return cand; } catch (_) {}
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

function parseIndex(file) {
  const out = [];
  let cur = null;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const s = line.match(/^\s*-\s*slug:\s*([^\s#]+)/);
    if (s) { cur = { slug: s[1].toLowerCase(), desk_mount: null, swe_writes: null }; out.push(cur); continue; }
    if (!cur) continue;
    const dm = line.match(/^\s*desk_mount:\s*([^\s#]+)/);
    if (dm) { cur.desk_mount = (dm[1] === "null") ? null : dm[1]; continue; }
    const sw = line.match(/^\s*swe_writes:\s*(true|false)/);
    if (sw) { cur.swe_writes = (sw[1] === "true"); }
  }
  return out;
}

/* Risolve la scrivania da un percorso: vince il segmento PIU' PROFONDO che combacia con un
 * desk_mount. Necessario perche' ogni repo-progetto vive DENTRO `SteelWolf_Empire`: senza la
 * regola del piu' profondo, ogni scrivania-progetto risulterebbe anche Hub. */
function deskFromPath(p, projects) {
  if (!p) return null;
  const segs = String(p).split(/[\\/]+/).filter(Boolean);
  let found = null;
  for (let i = 0; i < segs.length; i++) {
    const hit = projects.find(x => x.desk_mount && x.desk_mount.toLowerCase() === segs[i].toLowerCase());
    if (hit) found = hit.slug;
  }
  return found;
}

try {
  if (process.env.CLAUDE_CODE_IS_COWORK === "1") process.exit(0);
  let raw = "";
  try { raw = fs.readFileSync(0, "utf8"); } catch (_) { process.exit(0); }
  if (!raw) process.exit(0);
  let j = {}; try { j = JSON.parse(raw); } catch (_) { process.exit(0); }

  const prompt = String(j.prompt || "");
  const m = prompt.match(/^\s*\/swe:(start|end|cycle)\b\s*([^\s]+)?/i);
  if (!m) process.exit(0);                       // non e' un comando swe: non ci riguarda
  const verb = m[1].toLowerCase();
  const launched = (m[2] || "predator").toLowerCase();

  const cwd = String(j.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd() || "");

  const idxFile = findIndex(cwd);
  if (!idxFile) {
    deny("STOP swe: non trovo `_PROJECTS_INDEX.yaml` risalendo da `" + cwd + "`.\n" +
         "Senza l'indice non posso stabilire quale progetto rappresenti questa scrivania, e " +
         "l'identita' del progetto e' fail-closed (ADR-027 §4). Apri la sessione dalla scrivania corretta.");
  }
  let projects = [];
  try { projects = parseIndex(idxFile); } catch (_) { projects = []; }
  if (!projects.length) deny("STOP swe: `_PROJECTS_INDEX.yaml` illeggibile o vuoto (" + idxFile + ").");

  const target = projects.find(p => p.slug === launched);
  if (!target) {
    deny("STOP swe: `" + launched + "` non e' uno slug valido.\n" +
         "Slug ammessi: " + projects.map(p => p.slug).join(", "));
  }
  if (target.swe_writes === false) {
    deny("STOP swe: `" + launched + "` e' un dominio ESTERNO (ecosistema/piattaforma a se').\n" +
         "swe non apre sessioni qui: usa il suo strumento (plugin `nexus` per nexus, dominio WorkDASH per workdash).");
  }

  /* Identita' della scrivania: due segnali indipendenti. In Cowork la radice del mount e'
   * autoritativa; su CLI resta la cwd. Se entrambi esistono e NON coincidono -> contraddizione. */
  const hostPaths = String(process.env.CLAUDE_CODE_WORKSPACE_HOST_PATHS || "");
  const primaryMount = hostPaths ? hostPaths.split(/[;:](?![\\/])/)[0] : "";
  const byMount = deskFromPath(primaryMount, projects);
  const byCwd = deskFromPath(cwd, projects);

  if (byMount && byCwd && byMount !== byCwd) {
    deny("STOP swe: segnali contraddittori sull'identita' della scrivania.\n" +
         "  radice mount -> `" + byMount + "`\n  cwd          -> `" + byCwd + "`\n" +
         "Non apro una sessione finche' il progetto non e' univoco (ADR-027 §4, fail-closed).");
  }
  const current = byMount || byCwd;

  if (!current) {
    deny("STOP swe: non riesco a stabilire quale progetto rappresenti questa scrivania.\n" +
         "  cwd: " + cwd + "\n" +
         "Nessun segmento combacia con un `desk_mount` dell'indice. L'identita' del progetto e' " +
         "fail-closed: apri la sessione dalla scrivania del progetto (ADR-027 §4).");
  }

  if (launched !== current) {
    deny("STOP swe: sei nella scrivania del progetto `" + current + "`, ma stai aprendo `" + launched + "`.\n" +
         "Ogni progetto ha la propria scrivania e la propria catena: qui puoi solo " +
         "`/swe:" + verb + " " + current + "`.\n" +
         "Per `" + launched + "` apri la SUA scrivania. L'Hub non e' un lanciatore (ADR-027 §4).");
  }
  process.exit(0);
} catch (e) {
  /* Un errore imprevisto NON puo' diventare un permesso: l'identita' e' fail-closed. */
  process.stderr.write("STOP swe: errore nel guard di dominio (" + (e && e.message ? e.message : e) + ").\n" +
                       "Per sicurezza non apro la sessione: l'identita' del progetto e' fail-closed.\n");
  process.exit(2);
}
