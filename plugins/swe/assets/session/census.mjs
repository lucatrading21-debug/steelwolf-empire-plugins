#!/usr/bin/env node
/* Censimento di migrazione: esegue il lettore su OGNI progetto dell'index e dice, per ciascuno,
 * se l'enforcement del gate lo aprirebbe o lo bloccherebbe, e cosa serve per migrarlo.
 * Sola lettura. uso: node census.mjs --root=<SteelWolf_Empire> --index=<_PROJECTS_INDEX.yaml> */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { nextSession } from "./swe-next-session.mjs";
import { POLICIES } from "./policy.mjs";
import { resolveBriefings } from "./briefings.mjs";
const arg = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const ROOT = resolve(arg("root", "."));
const IDX = arg("index", join(ROOT, "hub", "steelwolf-empire-hub", "_status", "_PROJECTS_INDEX.yaml"));
const out = [];
let invalide = 0, apribili = 0;
let cur = null;
for (const line of readFileSync(IDX, "utf8").split(/\r?\n/)) {
  let m;
  if ((m = line.match(/^\s*-\s*slug:\s*([^\s#]+)/))) { cur = { slug: m[1], repo: null, session_log: null, briefings: null, prefix: "", swe_writes: null, bootstrap: null, gate: null }; out.push(cur); continue; }
  if (!cur) continue;
  if ((m = line.match(/^\s*repo:\s*([^\s#]+)/))) cur.repo = m[1] === "null" ? null : m[1];
  else if ((m = line.match(/^\s*session_log:\s*([^\s#]+)/))) cur.session_log = m[1];
  else if ((m = line.match(/^\s*briefings:\s*([^\s#]+)/))) cur.briefings = m[1] === "null" ? null : m[1];
  else if ((m = line.match(/^\s*session_prefix:\s*"([^"]*)"/))) cur.prefix = m[1];
  else if ((m = line.match(/^\s*swe_writes:\s*(true|false)/))) cur.swe_writes = m[1] === "true";
  else if ((m = line.match(/^\s*bootstrap:\s*([^\s#]+)/))) cur.bootstrap = m[1];
  else if ((m = line.match(/^\s*session_gate:\s*([^\s#]+)/))) cur.gate = m[1];
}
console.log(`CENSIMENTO MIGRAZIONE GATE · index: ${IDX}\n`);
const rows = [];
for (const p of out) {
  if (p.swe_writes === false) { rows.push([p.slug, "-", "DOMINIO ESTERNO", "n/a", "swe non apre sessioni qui"]); continue; }
  const reg = p.repo && p.session_log ? join(ROOT, p.repo.split("/").join("/"), p.session_log) : null;
  const brd = p.briefings ? join(ROOT, p.briefings.split("/").join("/")) : null;
  const regExists = reg ? existsSync(reg) : false;
  const r = nextSession(regExists ? readFileSync(reg, "utf8") : "", {
    prefix: p.prefix || "S", briefings: resolveBriefings(brd), registryExists: regExists, bootstrap: p.bootstrap,
  });
  const need = [];
  if (r.codes.includes("NO_AUTHORITATIVE_SOURCE")) need.push("aggiungere blocco STATO NUMERAZIONE");
  if (r.codes.includes("BRIEFINGS_MISSING")) need.push("riparare cartella briefing");
  if (r.codes.includes("SESSION_ALREADY_BOOKED")) need.push("sessione gia aperta (atteso se attiva)");
  if (r.codes.includes("HOLD_MARKER")) need.push("decisione owner sulla sospensione");
  if (r.codes.includes("NO_REGISTRY")) need.push("registro assente e non bootstrap");
  /* POLICY: dichiarata nell'index; se assente, il censimento PROPONE quella derivata dallo stato. */
  const declared = p.gate;
  /* La proposta si deriva dallo STATO MISURATO, non dal solo campo index: un progetto
   * dichiarato on-demand che ha gia un registro NON e' piu in bootstrap. */
  const proposed = (r.source === "bootstrap") ? "bootstrap" : (r.source === "block" ? "enforce" : "hold-migration");
  if (p.gate && !POLICIES.includes(p.gate)) { invalide++; }
  const apribile = (p.gate || "hold-migration") !== "hold-migration" && POLICIES.includes(p.gate || "hold-migration") && r.status === "OK";
  const policy = declared ? declared + (POLICIES.includes(declared) ? " (dichiarata)" : " NON VALIDA") : "hold-migration [OGGI] -> " + proposed + " [PROPOSTA]";
  rows.push([p.slug, (p.prefix || "S") + "*", `${apribile ? "APRE" : "NO"} ${r.proposed || "-"} [${r.source}]`, policy, need.length ? need.join(" · ") : (r.status === "OK" ? "pronto" : r.codes.join(","))]);
}
const w = [0, 1, 2, 3].map(i => Math.max(...rows.map(r => String(r[i]).length)));
console.log(`  ${"progetto".padEnd(w[0])}  ${"pfx".padEnd(w[1])}  ${"esito gate".padEnd(w[2])}  ${"policy".padEnd(w[3])}  cosa serve`);
console.log(`  ${"-".repeat(w[0])}  ${"-".repeat(w[1])}  ${"-".repeat(w[2])}  ${"-".repeat(w[3])}  ----------`);
for (const r of rows) console.log(`  ${String(r[0]).padEnd(w[0])}  ${String(r[1]).padEnd(w[1])}  ${String(r[2]).padEnd(w[2])}  ${String(r[3]).padEnd(w[3])}  ${r[4]}`);
const pronti = rows.filter(r => String(r[2]).startsWith("APRE")).length;
if (invalide) console.log(`\n  STOP: ${invalide} progetti con session_gate NON VALIDA`);
console.log(`\n  aperti ORA dal gate: ${pronti}/${rows.length}  ·  policy: enforce = vincolante | hold-migration = apertura vietata fino alla chiusura | bootstrap = primo avvio`);

process.exit(invalide ? 2 : 0);
