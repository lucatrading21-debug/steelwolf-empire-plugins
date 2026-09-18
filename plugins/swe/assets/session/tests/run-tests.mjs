/* Runner v5 — gira dalla gerarchia INSTALLABILE: <session>/tests/run-tests.mjs
 * NESSUNA CANCELLAZIONE: gli artefatti restano in --runs=<dir>/<id>, conservata dall'owner.
 * Senza --runs i casi gate sono SKIP dichiarati, mai PASS taciti.
 * uso: node run-tests.mjs --root=<SteelWolf_Empire> [--runs=<dir scrivibile fuori dai repo>] */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { nextSession } from "../swe-next-session.mjs";
import { resolveBriefings } from "../briefings.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = resolve(HERE, "..");
const FX = join(HERE, "fixtures");
const A = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
/* #14: nessun default fantasioso. --root e' obbligatorio: un albero indovinato non e' una misura. */
const ROOT = A("root", null);
if (!ROOT) { console.error("STOP: --root=<radice SteelWolf_Empire> obbligatorio"); process.exit(3); }
const RUNS = A("runs", null);
const J = join(ROOT, "steelwolf-trading-journal"), H = join(ROOT, "hub", "steelwolf-empire-hub");
const f = (n) => join(FX, n), b = (n) => join(FX, n);
const sha = (s) => createHash("sha256").update(s).digest("hex");
/* inventario = nome + dimensione + hash di OGNI file: rileva una modifica, non solo una creazione */
const inv = (d) => (existsSync(d) ? readdirSync(d).sort().map(n => { const p = join(d, n); const st = statSync(p);
  return st.isFile() ? `${n}:${st.size}:${sha(readFileSync(p)).slice(0, 16)}` : `${n}:DIR`; }).join("|") : "<assente>");

let pass = 0, fail = 0, skip = 0;
const chk = (ok, id, desc, det) => { console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${desc}`); if (det) console.log(det); ok ? pass++ : fail++; };
const skipped = (id, desc, why) => { console.log(`SKIP  ${id}  ${desc}\n      ${why}`); skip++; };

const C = [
 ["T1","[LIVE] Journal REALE (cartella briefing assente sul disco)",join(J,"docs","SESSION_LOG.md"),{prefix:"S",briefings:join(J,"SESSION_BRIEFINGS")},"STOP","S46",["HOLD_MARKER","BRIEFINGS_MISSING"],[]],
 ["T2","[LIVE] HUB REALE — S204 gia aperta: DEVE vedere il briefing",join(H,"SESSION_LOG.md"),{prefix:"S",briefings:join(H,"SESSION_BRIEFINGS")},"STOP","S204",["SESSION_ALREADY_BOOKED","BRIEFINGS_REGISTRY_MISMATCH","NO_AUTHORITATIVE_SOURCE"],[]],
 ["T3","base valida + briefing esistenti e vuoti",f("f12_ok_base.md"),{prefix:"S",briefings:b("b_empty")},"OK","S46",[],["BRIEFINGS_MISSING","SESSION_ALREADY_BOOKED"]],
 ["T4","S46 gia prenotata da briefing",f("f12_ok_base.md"),{prefix:"S",briefings:b("b_S46_prenotata")},"STOP","S46",["SESSION_ALREADY_BOOKED"],[]],
 ["T5","briefing e registro discordanti",f("f12_ok_base.md"),{prefix:"S",briefings:b("b_discorde")},"STOP","S46",["BRIEFINGS_REGISTRY_MISMATCH"],["SESSION_ALREADY_BOOKED"]],
 ["T6","cartella briefing NON indicata",f("f12_ok_base.md"),{prefix:"S",briefings:null},"STOP","S46",["BRIEFINGS_NOT_PROVIDED"],["BRIEFINGS_MISSING"]],
 ["T7","cartella INDICATA ma ASSENTE (assenza != vuota)",f("f12_ok_base.md"),{prefix:"S",briefings:b("b_non_esiste")},"STOP","S46",["BRIEFINGS_MISSING"],["BRIEFINGS_NOT_PROVIDED"]],
 ["T8","sessione gia ATTIVA",f("f2_attiva.md"),{prefix:"S",briefings:b("b_empty")},"STOP","S47",["HOLD_MARKER"],[]],
 ["T9","fallback fail-closed, verso decrescente",f("f3_decrescente.md"),{prefix:"S",briefings:b("b_empty")},"STOP","S45",["NO_AUTHORITATIVE_SOURCE"],[]],
 ["T10","fallback fail-closed, verso crescente",f("f4_crescente.md"),{prefix:"S",briefings:b("b_empty")},"STOP","S45",["NO_AUTHORITATIVE_SOURCE"],[]],
 ["T11","prefisso nativo BA-S",f("f5_prefisso_ba.md"),{prefix:"BA-S",briefings:b("b_empty")},"STOP","BA-S59",["NO_AUTHORITATIVE_SOURCE"],[]],
 ["T12","chiusa > occupata",f("f6_contraddittorio.md"),{prefix:"S",briefings:b("b_empty")},"STOP",null,["CONTRADICTION_CLOSED_GT_OCCUPIED"],[]],
 ["T13","blocco parziale",f("f7_parziale.md"),{prefix:"S",briefings:b("b_empty")},"STOP",null,["BLOCK_INCOMPLETE"],[]],
 ["T14","numeri solo citati nel testo",f("f8_assente.md"),{prefix:"S",briefings:b("b_empty")},"STOP",null,["NO_DATA"],[]],
 ["T15","intestazione oltre l'occupato",f("f9_disallineato.md"),{prefix:"S",briefings:b("b_empty")},"STOP","S46",["REGISTRY_HEADING_BEYOND_OCCUPIED"],[]],
 ["T16","blocchi duplicati",f("f10_duplicato.md"),{prefix:"S",briefings:b("b_empty")},"STOP",null,["BLOCK_DUPLICATED"],[]],
 ["T17","salto next != occupied+1",f("f11_salto.md"),{prefix:"S",briefings:b("b_empty")},"STOP","S50",["NUMBERING_GAP"],[]],
 ["T18","numero richiesto OCCUPATO (S45)",f("f12_ok_base.md"),{prefix:"S",briefings:b("b_empty"),requested:"S45"},"STOP","S46",["REQUESTED_OCCUPIED","REQUESTED_MISMATCH"],[]],
 ["T19","numero richiesto corretto (S46)",f("f12_ok_base.md"),{prefix:"S",briefings:b("b_empty"),requested:"S46"},"OK","S46",[],["REQUESTED_OCCUPIED"]],
 ["T20","campi senza marcatore",f("f13_senza_marcatore.md"),{prefix:"S",briefings:b("b_empty")},"STOP","S45",["BLOCK_UNDELIMITED"],[]],
 ["T21","BOOTSTRAP: registro assente -> S1",f("NON_ESISTE.md"),{prefix:"S",briefings:b("b_non_esiste"),registryExists:false,bootstrap:"on-demand"},"OK","S1",[],["NO_DATA","BRIEFINGS_MISSING","NO_REGISTRY"]],
 ["T22","registro assente e progetto NON on-demand",f("NON_ESISTE.md"),{prefix:"S",briefings:b("b_empty"),registryExists:false,bootstrap:null},"STOP",null,["NO_REGISTRY"],[]],
 ["T23","BOOTSTRAP: S1 gia prenotata",f("NON_ESISTE.md"),{prefix:"S",briefings:b("b_S1_prenotata"),registryExists:false,bootstrap:"on-demand"},"STOP","S1",["SESSION_ALREADY_BOOKED"],[]],
 ["JT-A","Journal PRE: S46 sospesa + cartella assente",f("jt_a_sospesa.md"),{prefix:"S",briefings:b("jt_brief_assente")},"STOP","S46",["HOLD_MARKER","BRIEFINGS_MISSING"],[]],
 ["JT-B","decisione owner registrata, cartella ancora assente",f("jt_b_sbloccata.md"),{prefix:"S",briefings:b("jt_brief_assente")},"STOP","S46",["BRIEFINGS_MISSING"],["HOLD_MARKER"]],
 ["JT-C","cartella riparata VUOTA -> PASS",f("jt_b_sbloccata.md"),{prefix:"S",briefings:b("jt_brief_vuota")},"OK","S46",[],["BRIEFINGS_MISSING","HOLD_MARKER","SESSION_ALREADY_BOOKED"]],
 ["JT-D","briefing S46 creato PRIMA del gate -> blocco",f("jt_b_sbloccata.md"),{prefix:"S",briefings:b("jt_brief_con_s46")},"STOP","S46",["SESSION_ALREADY_BOOKED"],[]],
];
console.log(`ambiente: ${process.platform} · node ${process.version}`);
console.log(`lettore:  ${SESSION_DIR}`);
console.log(`root:     ${resolve(ROOT)}`);
console.log(`runs:     ${RUNS || "(non indicata -> casi gate SKIP)"}\n`);
const LIVE = process.argv.includes("--live");
for (const [id, desc, file, o, exp, expProp, must, forbid] of C) {
  if (desc.startsWith("[LIVE]") && !LIVE) { skipped(id, desc, "stato vivo: eseguire con --live. Escluso dal gate d'installazione perche' cambia con le sessioni reali (S204 chiusa -> atteso diverso)"); continue; }
  let r; try { const ex = o.registryExists !== false && existsSync(file);
    r = nextSession(ex ? readFileSync(file, "utf8") : "", { prefix: o.prefix, requested: o.requested ?? null,
      briefings: resolveBriefings(o.briefings), registryExists: ex, bootstrap: o.bootstrap ?? null }); }
  catch (e) { chk(false, id, desc, `      ERRORE ${e.message}`); continue; }
  const miss = must.filter(c => !r.codes.includes(c)), hit = forbid.filter(c => r.codes.includes(c));
  const ok = r.status === exp && (expProp === null || r.proposed === expProp) && !miss.length && !hit.length;
  let d = `      status=${r.status}/${r.proposed} fonte=${r.source} codici=[${r.codes.join(",")}]`;
  if (miss.length) d += `\n      MANCANO: ${miss.join(",")}`;
  if (hit.length) d += `\n      VIETATI PRESENTI: ${hit.join(",")}`;
  chk(ok, id, desc, d);
}

/* ---------- ENTRYPOINT UNICO: policy + ordine reale ---------- */
const GATE = join(SESSION_DIR, "session-gate.mjs");
const IDX  = join(FX, "idx", "index_policy.yaml");
const FROOT= join(FX, "root");
const run = (a) => { try { return { out: execFileSync(process.execPath, [GATE, ...a], { encoding: "utf8" }), code: 0 }; }
                     catch (e) { return { out: (e.stdout || "") + (e.stderr || ""), code: e.status }; } };
const base = [`--root=${FROOT}`, `--index=${IDX}`];
let g;
g = run([...base, "--slug=p-enforce", "--mode=check"]);
chk(g.code === 0 && /PASS S46/.test(g.out) && /READ-ONLY/.test(g.out), "P1", "enforce: PASS e designatore calcolato dal gate (senza --session)", `      exit=${g.code}`);
g = run([...base, "--slug=p-hold", "--mode=check"]);
chk(g.code === 2 && /HOLD_MIGRATION/.test(g.out), "P2", "hold-migration: apertura vietata, nessun numero proposto", `      exit=${g.code}`);
g = run([...base, "--slug=p-nogate", "--mode=check"]);
chk(g.code === 2 && /HOLD_MIGRATION/.test(g.out) && /assente/.test(g.out), "P3", "campo assente => hold-migration (default restrittivo)", `      exit=${g.code}`);
g = run([...base, "--slug=p-bad", "--mode=check"]);
chk(g.code === 2 && /POLICY_UNKNOWN/.test(g.out), "P4", "valore ritirato (observe) RIFIUTATO, non interpretato", `      exit=${g.code}`);
g = run([...base, "--slug=p-external", "--mode=check"]);
chk(g.code === 2 && /EXTERNAL_DOMAIN/.test(g.out), "P5", "dominio esterno: swe non apre", `      exit=${g.code}`);
g = run([...base, "--slug=p-inesistente", "--mode=check"]);
chk(g.code === 2 && /SLUG_UNKNOWN/.test(g.out), "P6", "slug ignoto: elenco degli slug validi", `      exit=${g.code}`);
g = run([...base, "--slug=p-enforce", "--mode=commit"]);
chk(g.code === 3 && /--session obbligatorio/.test(g.out), "P7", "commit senza --session: rifiuta (li' si conferma, non si calcola)", `      exit=${g.code}`);
g = run([...base, "--slug=p-enforce", "--mode=commit", "--session=S46"]);
chk(g.code === 2 && /cartella receipts assente/.test(g.out), "P8", "commit senza cartella receipts: STOP, non la crea il gate", `      exit=${g.code}`);

/* ---------- --mode=close (S209, D13 — S208_D13_DESIGN sez. 3): gate numerazione IN CHIUSURA ----------
 * Fixture statiche in fixtures/close/: nessuna scrittura, quindi nessuna --runs richiesta. */
const CX = join(FX, "close"), cb = (s) => [`--root=${CX}`, `--index=${join(CX, "idx.yaml")}`, `--slug=${s}`, "--mode=close"];
const cinv = () => ["c-ok/reg.md"].map(x => sha(readFileSync(join(CX, x)))).join("|") + "#" + inv(join(CX, "c-ok", "brief"));
const c0 = cinv();
g = run([...cb("c-ok"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out) && /READ-ONLY/.test(g.out) && cinv() === c0, "C1", "close positivo: OCCUPATO=CHIUSA=S45, PROSSIMO=S46, briefing e intestazione presenti; registro e briefing invariati", `      exit=${g.code}`);
g = run([...cb("c-s206"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_OCCUPIED_MISMATCH/.test(g.out) && /CLOSE_NOT_MARKED_CLOSED/.test(g.out) && /REGISTRY_HEADING_BEYOND_OCCUPIED/.test(g.out), "C2", "close NEGATIVO caso S206: blocco non aggiornato in chiusura", `      exit=${g.code}`);
g = run([...cb("c-archived"), "--session=S45"]);
chk(g.code === 2 && /NO_AUTHORITATIVE_SOURCE/.test(g.out) && /CLOSE_NO_BLOCK/.test(g.out), "C3", "close NEGATIVO: blocco assente dal log vivo (finito in archivio)", `      exit=${g.code}`);
g = run([...cb("c-gap"), "--session=S45"]);
chk(g.code === 2 && /NUMBERING_GAP/.test(g.out), "C4", "close NEGATIVO: gap di numerazione (PROSSIMO != OCCUPATO+1)", `      exit=${g.code}`);
g = run([...cb("c-nobrief"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_BRIEFING_MISSING/.test(g.out), "C5", "close NEGATIVO: briefing S45_OPEN.md assente", `      exit=${g.code}`);
g = run([...cb("c-ok"), "--session=S44"]);
chk(g.code === 2 && /CLOSE_OCCUPIED_MISMATCH/.test(g.out), "C6", "close NEGATIVO: numero diverso dall'occupato dichiarato", `      exit=${g.code}`);
g = run(cb("c-ok"));
chk(g.code === 3 && /--session obbligatorio/.test(g.out), "C7", "close senza --session: uso errato (exit 3)", `      exit=${g.code}`);

if (!RUNS) { for (const id of ["G1","G2","G3","G4","G5","O1","O2","O3","O4","O5"]) skipped(id, "caso receipt", "--runs=<dir> non indicata"); }
else {
  const dir = join(resolve(RUNS), "run-" + new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(join(dir, "repo", "_session", "receipts"), { recursive: true });
  mkdirSync(join(dir, "brief"), { recursive: true });
  writeFileSync(join(dir, "repo", "reg.md"), readFileSync(join(FX, "f12_ok_base.md"), "utf8"));
  writeFileSync(join(dir, "idx.yaml"), `projects:\n  - slug: p-rec\n    repo: repo\n    session_log: reg.md\n    briefings: brief\n    session_prefix: ""\n    swe_writes: true\n    session_gate: enforce\n`);
  const rb = [`--root=${dir}`, `--index=${join(dir, "idx.yaml")}`, "--slug=p-rec"];
  const i0 = inv(join(dir, "repo", "_session", "receipts"));
  g = run([...rb, "--mode=check"]);
  chk(g.code === 0 && inv(join(dir, "repo", "_session", "receipts")) === i0, "G1", "check: PASS e inventario+hash receipts INVARIATI", `      exit=${g.code}`);
  g = run([...rb, "--mode=commit", "--session=S46"]);
  chk(g.code === 0 && /mode=commit/.test(g.out), "G2", "commit: receipt nel percorso DERIVATO dal gate", `      exit=${g.code} ${(g.out.split("receipt:")[1]||"").trim()}`);
  g = run([...rb, "--mode=commit", "--session=S46"]);
  chk(g.code === 2 && /esiste gia un receipt per p-rec\/S46/.test(g.out), "G3", "secondo receipt per lo STESSO numero: rifiutato (un numero, un receipt)", `      exit=${g.code}`);
  g = run([...rb, "--mode=commit", "--session=S46", `--receipt=${join(dir, "altrove.json")}`]);
  chk(g.code === 3 && /percorso canonico/.test(g.out), "G4", "receipt fuori dal percorso canonico: rifiutato", `      exit=${g.code}`);
  const rcp = join(dir, "repo", "_session", "receipts", "p-rec_S46.json");
  g = run([...rb, "--mode=verify", "--session=S46", `--receipt=${rcp}`]);
  chk(g.code === 0 && /VALIDO/.test(g.out), "G5", "verify: identita completa e rilettura concordi", `      exit=${g.code}`);
  /* ---------- OPEN S<n> in check (S209, D13 — S208 sez. 4): nella stessa run, dopo G5 ---------- */
  writeFileSync(join(dir, "brief", "S46_OPEN.md"), "");
  g = run([...rb, "--mode=check"]);
  chk(g.code === 0 && /OPEN S46/.test(g.out) && /"status":"open"/.test(g.out) && !/PASS S46/.test(g.out), "O1", "check a sessione aperta (briefing S46 + receipt coerente): OPEN S46, exit 0, non PASS", `      exit=${g.code}`);
  writeFileSync(join(dir, "brief", "S47_OPEN.md"), "");
  g = run([...rb, "--mode=check"]);
  chk(g.code === 2 && /BRIEFINGS_REGISTRY_MISMATCH/.test(g.out) && !/OPEN S46/.test(g.out), "O2", "OPEN NEGATIVO: due briefing oltre il registro -> STOP", `      exit=${g.code}`);
  const d2 = join(resolve(RUNS), "run-open-noreceipt-" + new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(join(d2, "repo", "_session", "receipts"), { recursive: true }); mkdirSync(join(d2, "brief"), { recursive: true });
  writeFileSync(join(d2, "repo", "reg.md"), readFileSync(join(FX, "f12_ok_base.md"), "utf8"));
  writeFileSync(join(d2, "brief", "S46_OPEN.md"), "");
  writeFileSync(join(d2, "idx.yaml"), `projects:\n  - slug: p-rec\n    repo: repo\n    session_log: reg.md\n    briefings: brief\n    session_prefix: ""\n    swe_writes: true\n    session_gate: enforce\n`);
  g = run([`--root=${d2}`, `--index=${join(d2, "idx.yaml")}`, "--slug=p-rec", "--mode=check"]);
  chk(g.code === 2 && /SESSION_ALREADY_BOOKED/.test(g.out) && !/OPEN S46/.test(g.out), "O3", "OPEN NEGATIVO: briefing S46 SENZA receipt di apertura -> STOP come prima", `      exit=${g.code}`);
  writeFileSync(join(d2, "repo", "_session", "receipts", "p-rec_S46.json"), readFileSync(rcp));
  /* receipt copiato dalla prima run: identita' (path, impronta) di un altro progetto -> NON coerente */
  g = run([`--root=${d2}`, `--index=${join(d2, "idx.yaml")}`, "--slug=p-rec", "--mode=check"]);
  chk(g.code === 2 && !/OPEN S46/.test(g.out), "O4", "OPEN NEGATIVO: receipt presente ma di un'altra identita' (path/registro) -> STOP", `      exit=${g.code}`);
  console.log(`  artefatti conservati: ${d2}`);
  const d3 = join(resolve(RUNS), "run-open-regchanged-" + new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(join(d3, "repo", "_session", "receipts"), { recursive: true }); mkdirSync(join(d3, "brief"), { recursive: true });
  writeFileSync(join(d3, "repo", "reg.md"), readFileSync(join(FX, "f12_ok_base.md"), "utf8"));
  writeFileSync(join(d3, "idx.yaml"), `projects:\n  - slug: p-rec\n    repo: repo\n    session_log: reg.md\n    briefings: brief\n    session_prefix: ""\n    swe_writes: true\n    session_gate: enforce\n`);
  const r3 = [`--root=${d3}`, `--index=${join(d3, "idx.yaml")}`, "--slug=p-rec"];
  g = run([...r3, "--mode=commit", "--session=S46"]);
  writeFileSync(join(d3, "brief", "S46_OPEN.md"), "");
  writeFileSync(join(d3, "repo", "reg.md"), readFileSync(join(FX, "f12_ok_base.md"), "utf8") + "\nriga aggiunta dopo l'apertura\n");
  g = run([...r3, "--mode=check"]);
  chk(g.code === 2 && !/OPEN S46/.test(g.out), "O5", "OPEN NEGATIVO: registro modificato dopo il receipt di apertura -> STOP", `      exit=${g.code}`);
  console.log(`  artefatti conservati: ${d3}`);
  console.log(`\n  artefatti conservati: ${dir}`);
}
console.log(`\nRISULTATO: ${pass} PASS / ${fail} FAIL / ${skip} SKIP su ${pass + fail + skip}  ·  ${process.platform}`);
process.exit(fail ? 1 : 0);
