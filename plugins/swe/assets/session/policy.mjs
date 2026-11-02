/* Risoluzione progetto + POLICY dall'index. Decisione della MACCHINA: l'istanza non assembla nulla.
 * enforce        progetto MIGRATO (ha il blocco STATO NUMERAZIONE) -> gate vincolante
 * bootstrap      primo avvio accertato -> registro assente ammesso, S1
 * hold-migration progetto ATTIVO e NON migrato -> nuova apertura VIETATA finche' non si chiude
 *                (la chiusura scrive il blocco e porta il progetto a enforce)
 * campo ASSENTE => hold-migration. Il default e' il piu' restrittivo, mai il piu' permissivo. */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
export const POLICIES = ["enforce", "bootstrap", "hold-migration"];
/* L9.13 / D-S214-1 (S215). "Oggi" per i controlli di chiusura e' il giorno civile dell'Empire (Italia), non quello
 * della macchina: in Cowork la VM e' in UTC e dopo mezzanotte italiana (fino all'01:00 con l'ora solare, alle 02:00 con
 * l'ora legale) dava ieri, cosi' una chiusura valida veniva respinta come "data nel futuro". Intl e non Temporal:
 * Temporal e' nativo solo da Node 26, la CI gira su Node 22.
 * Fail-closed: fuso non risolto esattamente o risultato non YYYY-MM-DD => eccezione, mai un ripiego sull'ora della macchina.
 * Limite dichiarato: con dati di fuso (tzdata/ICU) superati Europe/Rome viene riconosciuto ma con regole vecchie; il
 * controllo non lo rileva. Rischio basso (regole italiane invariate da decenni), coperto dai test sugli istanti fissi. */
export const EMPIRE_TZ = "Europe/Rome";
export function todayIn(now = new Date(), timeZone = EMPIRE_TZ) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", numberingSystem: "latn" });
  if (f.resolvedOptions().timeZone !== timeZone) throw new Error(`fuso ${timeZone} risolto come ${f.resolvedOptions().timeZone}`);
  const p = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value]));
  const d = `${p.year}-${p.month}-${p.day}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error(`data non calcolabile in ${timeZone}: "${d}"`);
  return d;
}
export function loadProjects(indexPath) {
  const out = []; let cur = null;
  for (const line of readFileSync(indexPath, "utf8").split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^\s*-\s*slug:\s*([^\s#]+)/))) { cur = { slug: m[1], repo: null, session_log: null, briefings: null, prefix: "", swe_writes: null, bootstrap: null, gate: null, branch: null }; out.push(cur); continue; }
    if (!cur) continue;
    if ((m = line.match(/^\s*repo:\s*([^\s#]+)/))) cur.repo = m[1] === "null" ? null : m[1];
    else if ((m = line.match(/^\s*session_log:\s*([^\s#]+)/))) cur.session_log = m[1];
    else if ((m = line.match(/^\s*briefings:\s*([^\s#]+)/))) cur.briefings = m[1] === "null" ? null : m[1];
    else if ((m = line.match(/^\s*session_prefix:\s*"([^"]*)"/))) cur.prefix = m[1];
    else if ((m = line.match(/^\s*swe_writes:\s*(true|false)/))) cur.swe_writes = m[1] === "true";
    else if ((m = line.match(/^\s*bootstrap:\s*([^\s#]+)/))) cur.bootstrap = m[1];
    else if ((m = line.match(/^\s*session_gate:\s*([^\s#]+)/))) cur.gate = m[1];
    else if ((m = line.match(/^\s*branch:\s*([^\s#]+)/))) cur.branch = m[1] === "null" ? null : m[1];   /* S211 (D13 Empire-wide): usato SOLO da --mode=receipt */
  }
  return out;
}
export function resolveProject(root, slug, indexPath) {
  const idx = indexPath || join(root, "hub", "steelwolf-empire-hub", "_status", "_PROJECTS_INDEX.yaml");
  if (!existsSync(idx)) return { error: `INDEX_MISSING: ${idx}` };
  const all = loadProjects(idx);
  const dup = all.map(x => x.slug.toLowerCase()).filter((v, i, a) => a.indexOf(v) !== i);
  if (dup.length) return { error: `INDEX_DUPLICATE_SLUG: ${[...new Set(dup)].join(", ")} — l'index non e' univoco` };
  const p = all.find(x => x.slug.toLowerCase() === String(slug).toLowerCase());
  if (!p) return { error: `SLUG_UNKNOWN: "${slug}" — validi: ${all.map(x => x.slug).join(", ")}` };
  if (p.swe_writes === false) return { error: `EXTERNAL_DOMAIN: "${slug}" e' gestito altrove; swe non apre sessioni qui` };
  if (!p.repo || !p.session_log) return { error: `PROJECT_INCOMPLETE: "${slug}" senza repo o session_log nell'index` };
  if (!p.briefings) return { error: `BRIEFINGS_NULL: "${slug}" non dichiara una cartella briefings` };
  const gate = p.gate || "hold-migration";
  if (!POLICIES.includes(gate)) return { error: `POLICY_UNKNOWN: session_gate="${gate}" per "${slug}" — ammessi: ${POLICIES.join(" | ")}` };
  return { slug: p.slug, prefix: p.prefix || "S", gate, declared: !!p.gate, branch: p.branch,
    bootstrap: gate === "bootstrap" ? "on-demand" : null,
    repoPath: resolve(join(root, p.repo)),
    registry: resolve(join(root, p.repo, p.session_log)),
    briefings: resolve(join(root, p.briefings)), indexPath: resolve(idx) };
}
