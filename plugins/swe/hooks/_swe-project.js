/* SteelWolf Empire - resolver di progetto condiviso (CARD-08, S189).
 *
 * Unica sorgente di verita' per: quale progetto rappresenta questa scrivania, e quale briefing
 * gli appartiene. Usato da `domain-guard.js` (enforcement del comando) e da `session-start.js`
 * (pre-render della card). Un solo resolver = nessuna divergenza fra i due.
 *
 * INVARIANTE (ADR-027 §4-bis): 1 progetto = 1 scrivania = 1 catena. L'Hub NON e' un lanciatore.
 * FAIL-CLOSED: se il progetto non e' stabilibile, o i segnali si contraddicono, si restituisce un
 * errore. Mai un default. Cio' che puo' degradare e' solo il livello di rendering, a valle.
 *
 * NOTA CARD-08: il legame progetto->briefing NON e' solo il percorso. `predator` e `bot-alliance`
 * condividono `hub/steelwolf-empire-hub/SESSION_BRIEFINGS`; il discriminante e' `session_prefix`.
 * Il binding e' quindi (cartella `briefings` + pattern da `session_prefix`).
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
const fs = require("fs");
const path = require("path");

const REL_INDEX = path.join("hub", "steelwolf-empire-hub", "_status", "_PROJECTS_INDEX.yaml");

function findEmpireRoot(startDir) {
  let d = startDir;
  for (let i = 0; i < 12 && d; i++) {
    try { if (fs.statSync(path.join(d, REL_INDEX)).isFile()) return d; } catch (_) {}
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

function loadProjects(empireRoot) {
  const file = path.join(empireRoot, REL_INDEX);
  const out = []; let cur = null;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const s = line.match(/^\s*-\s*slug:\s*([^\s#]+)/);
    if (s) { cur = { slug: s[1].toLowerCase(), repo: null, briefings: null, session_prefix: "", desk_mount: null, swe_writes: null }; out.push(cur); continue; }
    if (!cur) continue;
    let m;
    if ((m = line.match(/^\s*repo:\s*([^\s#]+)/)))          cur.repo = (m[1] === "null") ? null : m[1];
    else if ((m = line.match(/^\s*briefings:\s*([^\s#]+)/))) cur.briefings = (m[1] === "null") ? null : m[1];
    else if ((m = line.match(/^\s*desk_mount:\s*([^\s#]+)/)))cur.desk_mount = (m[1] === "null") ? null : m[1];
    else if ((m = line.match(/^\s*session_prefix:\s*"([^"]*)"/))) cur.session_prefix = m[1];
    else if ((m = line.match(/^\s*swe_writes:\s*(true|false)/)))   cur.swe_writes = (m[1] === "true");
  }
  return out;
}

/* Vince il segmento PIU' PROFONDO che combacia con un desk_mount: ogni repo-progetto vive dentro
 * `SteelWolf_Empire`, quindi senza questa regola ogni scrivania-progetto risulterebbe anche Hub. */
function deskFromPath(p, projects) {
  if (!p) return null;
  const segs = String(p).split(/[\\/]+/).filter(Boolean);
  let found = null;
  for (const seg of segs) {
    const hit = projects.find(x => x.desk_mount && x.desk_mount.toLowerCase() === seg.toLowerCase());
    if (hit) found = hit.slug;
  }
  return found;
}

/* Identita' della scrivania.
 * CONVENZIONE ADR-027 (resa ESPLICITA in S189): una scrivania monta L1 primario + L2 + L3 `hub/`.
 * Il PRIMO mount e' il livello primario, quindi determina il progetto. Gli altri mount che risolvono
 * a progetti diversi sono ATTESI (il livello L3 e' sempre l'hub) e non costituiscono contraddizione.
 * Il valore usato viene sempre DICHIARATO nel probe: una convenzione taciuta e' un falso verde in attesa.
 * Casi fail-closed: (a) il primo mount non risolve ma un mount successivo si' -> non si sa quale sia il
 * primario; (b) primo mount e cwd risolvono a progetti diversi. */
function resolveDesk(opts) {
  const projects = opts.projects;
  const mounts = String(opts.hostPaths || "").split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const resolved = mounts.map(m => ({ path: m, slug: deskFromPath(m, projects) }));
  const first = resolved.length ? resolved[0] : null;
  const laterHits = resolved.slice(1).filter(r => r.slug);
  const byCwd = deskFromPath(opts.cwd, projects);

  if (first && !first.slug && laterHits.length) {
    return { error: "mount primario non riconosciuto (" + first.path + ") ma altri mount risolvono a `" +
                    laterHits.map(r => r.slug).join("`, `") + "`: quale sia il primario e' indeterminato" };
  }
  const byMount = first ? first.slug : null;
  if (byMount && byCwd && byMount !== byCwd) {
    return { error: "segnali contraddittori sull'identita' della scrivania (mount primario=" + byMount + ", cwd=" + byCwd + ")" };
  }
  const slug = byMount || byCwd;
  if (!slug) return { error: "identita' della scrivania non stabilibile: nessun segmento combacia con un desk_mount" };
  return {
    slug: slug,
    signal: byMount ? ("mount primario [0] = " + first.path) : ("cwd = " + opts.cwd),
    others: laterHits.map(r => r.slug).filter(s => s !== slug)
  };
}

/* Pattern dei briefing dal session_prefix. Prefisso vuoto -> catena 'S'.
 * I separatori '-'/'_' sono resi intercambiabili: sul disco convivono BA-S53_OPEN.md e BA_S53_OPEN.md. */
function briefingPattern(prefix) {
  const base = (prefix && prefix.length) ? prefix : "S";
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[-_]/g, "[-_]");
  return new RegExp("^" + esc + "(\\d+)_OPEN\\.md$");
}

/* Briefing DEL progetto risolto. Nessun fallback all'Hub, nessun "piu' recente" globale.
 * 0 candidati -> errore. Piu' candidati allo stesso numero -> errore (ambiguita'). */
function resolveBriefing(project, empireRoot) {
  if (!project.briefings) return { error: "il progetto `" + project.slug + "` non dichiara una cartella `briefings` nell'index" };
  const dir = path.join(empireRoot, project.briefings.split("/").join(path.sep));
  let names;
  try { names = fs.readdirSync(dir); }
  catch (_) { return { error: "cartella briefing assente: " + dir }; }
  const re = briefingPattern(project.session_prefix);
  const hits = [];
  for (const n of names) { const m = n.match(re); if (m) hits.push({ name: n, n: parseInt(m[1], 10) }); }
  if (!hits.length) {
    return { error: "nessun briefing per `" + project.slug + "` in " + dir + " (pattern " + re.source + ")" };
  }
  const max = Math.max.apply(null, hits.map(h => h.n));
  const top = hits.filter(h => h.n === max);
  if (top.length > 1) {
    return { error: "briefing ambiguo per `" + project.slug + "`: " + top.map(t => t.name).join(" + ") + " hanno lo stesso numero " + max };
  }
  return { file: path.join(dir, top[0].name), n: max, dir: dir, pattern: re.source };
}

module.exports = { findEmpireRoot, loadProjects, deskFromPath, resolveDesk, briefingPattern, resolveBriefing };
