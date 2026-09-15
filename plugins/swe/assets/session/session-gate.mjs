#!/usr/bin/env node
/* session-gate — ENTRYPOINT UNICO. Legge index + slug, applica la policy, esegue il gate.
 * L'istanza passa root e slug: non risolve percorsi, non sceglie la policy, non compone la decisione.
 *   --mode=check   PRE-CARD, read-only assoluto
 *   --mode=commit  POST-CONFERMA, receipt esclusivo
 *   --mode=verify  ricontrollo del receipt (identita completa + rilettura)
 * exit 0 PASS · 2 STOP · 3 uso errato. (c) 2026 Luke SteelWolf. */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve as resolvePath } from "node:path";
import { createHash } from "node:crypto";
import { nextSession } from "./swe-next-session.mjs";
import { resolveBriefings } from "./briefings.mjs";
import { resolveProject } from "./policy.mjs";
const A = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const die = (c, l) => { console.error("SESSION GATE: STOP\n" + l.map(x => "  · " + x).join("\n")); process.exit(c); };
const mode = A("mode", "check");
if (!["check", "commit", "verify"].includes(mode)) die(3, [`--mode="${mode}": check | commit | verify`]);
const root = A("root"), slug = A("slug");
if (!root || !slug) die(3, ["--root e --slug sono obbligatori"]);
const P = resolveProject(root, slug, A("index", null));
if (P.error) die(2, [P.error]);

/* POLICY hold-migration: nessuna apertura, e il rimedio e' nominato. */
if (P.gate === "hold-migration")
  die(2, [`HOLD_MIGRATION: "${P.slug}" e' attivo e NON migrato (session_gate=${P.declared ? "hold-migration" : "assente -> default hold-migration"}).`,
          `Nuova apertura vietata finche' la sessione in corso non e' chiusa: la chiusura scrive il blocco STATO NUMERAZIONE e porta il progetto a session_gate: enforce.`,
          `Nessuna scrittura, nessun numero proposto.`]);

const exists0 = existsSync(P.registry);
/* ENTRYPOINT UNICO: in check il designatore lo calcola il gate. L'istanza non lo compone,
 * non lo ricostruisce e non chiama un secondo strumento. In commit/verify va passato quello
 * che l'owner ha confermato sulla card. */
let session = A("session", null);
if (!session) {
  if (mode !== "check") die(3, [`--session obbligatorio in mode=${mode}: deve essere il numero CONFERMATO dall'owner sulla card.`]);
  const probe = nextSession(exists0 ? readFileSync(P.registry, "utf8") : "", { prefix: P.prefix, briefings: resolveBriefings(P.briefings), registryExists: exists0, bootstrap: P.bootstrap });
  if (!probe.proposed) die(2, probe.blockers.map(b => `[${b.code}] ${b.message}`));
  session = probe.proposed;
}
const exists = exists0;
const text = exists ? readFileSync(P.registry, "utf8") : "";
const br = resolveBriefings(P.briefings);
const ident = { project: P.slug, prefix: P.prefix, session, policy: P.gate, bootstrap: P.bootstrap,
  registryPath: P.registry, briefingsPath: P.briefings,
  registrySha256: exists ? sha(text) : null,
  briefingsFingerprint: br.exists ? sha(JSON.stringify([...br.names].sort())) : null };
const r = nextSession(text, { prefix: P.prefix, requested: session, briefings: br, registryExists: exists, bootstrap: P.bootstrap });

if (mode === "verify") {
  const rp = A("receipt"); if (!rp) die(3, ["--receipt mancante in verify"]);
  let rec; try { rec = JSON.parse(readFileSync(rp, "utf8")); } catch (e) { die(2, ["receipt illeggibile: " + e.message]); }
  const bad = [];
  if (rec.kind !== "session-number") bad.push(`tipo "${rec.kind}", atteso "session-number"`);
  for (const k of ["project", "prefix", "session", "policy", "bootstrap", "registryPath", "briefingsPath", "registrySha256", "briefingsFingerprint"])
    if (rec[k] !== ident[k]) bad.push(`receipt ${k === "registrySha256" || k === "briefingsFingerprint" ? "OBSOLETO" : "INCOERENTE"} su ${k}: emesso "${rec[k]}", in uso "${ident[k]}"`);
  if (r.status !== "OK") bad.push(...r.blockers.map(b => `non piu valido alla rilettura: [${b.code}] ${b.message}`));
  if (bad.length) die(2, bad);
  console.log(`SESSION GATE: receipt VALIDO — ${rec.project} / ${rec.session} (policy ${rec.policy})`); process.exit(0);
}
if (r.status !== "OK") die(2, r.blockers.map(b => `[${b.code}] ${b.message}`));
if (mode === "check") {
  console.log(`SESSION GATE: PASS ${r.next} — ${P.slug} (policy ${P.gate}, mode=check READ-ONLY: nessun file creato o modificato)`);
  console.log(JSON.stringify({ ...ident, session: r.next, source: r.source })); process.exit(0);
}
/* Il percorso del receipt lo DERIVA il gate: accettarlo dal chiamante permetteva N receipt
 * validi e concorrenti per lo stesso numero, su path diversi (misurato in S204). */
const dir = join(P.repoPath, "_session", "receipts");
const out = join(dir, `${P.slug}_${r.next}.json`);
if (!existsSync(dir)) die(2, [`cartella receipts assente: ${dir} — creala prima (e' owner-side, non la creo io)`]);
const given = A("receipt", null);
if (given && resolvePath(given) !== out) die(3, [`--receipt="${given}" non e' il percorso canonico. Il gate scrive SOLO in ${out}`]);
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  let e; try { e = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch { continue; }
  if (e.project === P.slug && e.session === r.next)
    die(2, [`esiste gia un receipt per ${P.slug}/${r.next}: ${f} — un numero, un receipt. Rimuoverlo e' decisione owner.`]);
}
try { writeFileSync(out, JSON.stringify({ kind: "session-number", version: 4, ...ident, session: r.next,
  lastOccupied: r.lastOccupied, lastClosed: r.lastClosed, source: r.source, briefingsCount: br.names.length,
  createdAt: new Date().toISOString() }, null, 1), { flag: "wx" }); }
catch (e) { die(2, ["scrittura esclusiva fallita: " + e.message]); }
console.log(`SESSION GATE: PASS ${r.next} — ${P.slug} (mode=commit)\n  receipt: ${out}`); process.exit(0);
