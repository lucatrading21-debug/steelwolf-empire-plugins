/* Runner v5 — gira dalla gerarchia INSTALLABILE: <session>/tests/run-tests.mjs
 * NESSUNA CANCELLAZIONE: gli artefatti restano in --runs=<dir>/<id>, conservata dall'owner.
 * Senza --runs i casi gate sono SKIP dichiarati, mai PASS taciti.
 * uso: node run-tests.mjs --root=<SteelWolf_Empire> [--runs=<dir scrivibile fuori dai repo>] */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { nextSession } from "../swe-next-session.mjs";
import { resolveBriefings } from "../briefings.mjs";
import { todayIn, EMPIRE_TZ } from "../policy.mjs";

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
/* A1-bis (S214): _status/<slug>.yaml accanto all'index deve dichiarare la sessione che si chiude (ADR-029). */
g = run([...cb("c-ok-nostatus"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_MISSING/.test(g.out) && /_TEMPLATE\.yaml/.test(g.out), "C8", "close NEGATIVO A1-bis: _status/<slug>.yaml assente (rimedio: template)", `      exit=${g.code}`);
g = run([...cb("c-ok-stale"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_STALE/.test(g.out) && /last_session = S44/.test(g.out), "C9", "close NEGATIVO A1-bis: _status fermo alla sessione precedente (caso Journal S53)", `      exit=${g.code}`);
g = run([...cb("c-ok-olddate"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && /precedente/.test(g.out) && !/CLOSE_STATUS_STALE/.test(g.out), "C10", "close NEGATIVO A1-bis: date precedente all'intestazione della sessione", `      exit=${g.code}`);
g = run([...cb("c-ok-future"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && /nel futuro/.test(g.out), "C11", "close NEGATIVO A1-bis: date nel futuro", `      exit=${g.code}`);
g = run([...cb("c-ok-comment"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C12", "close positivo A1-bis: commenti YAML in riga (formato reale di predator.yaml) accettati", `      exit=${g.code}`);
g = run([...cb("c-ok-bom"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C13", "close positivo A1-bis: file con BOM (Windows PowerShell 5.1) accettato; fixture LF per la regola eol=lf del payload", `      exit=${g.code}`);
/* L9.17 / A3 (S215): `next` deve citare la sessione successiva (designatore nativo, parola intera). */
g = run([...cb("c-next-missing"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_MISSING/.test(g.out) && !/CLOSE_STATUS_NEXT_STALE/.test(g.out), "C14", "close NEGATIVO A3: next assente", `      exit=${g.code}`);
g = run([...cb("c-next-stale"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_STALE/.test(g.out) && /non cita S46/.test(g.out), "C15", "close NEGATIVO A3: next fermo alla sessione che si chiude (caso predator S213/S214)", `      exit=${g.code}`);
g = run([...cb("c-next-block"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C16", "close positivo A3: next su piu' righe (blocco YAML >-, formato Strategy-Lab) con S46 nella seconda riga", `      exit=${g.code}`);
g = run([...cb("c-next-quoted"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C17", "close positivo A3: next fra virgolette con \\\" e # dentro, commento vero dopo", `      exit=${g.code}`);
g = run([...cb("c-next-single"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C18", "close positivo A3: next fra apici singoli con '' (apostrofo YAML)", `      exit=${g.code}`);
g = run([...cb("c-next-comment-only"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_MISSING/.test(g.out), "C19", "close NEGATIVO A3: S46 solo nel commento = next vuoto", `      exit=${g.code}`);
g = run([...cb("c-next-trap"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_STALE/.test(g.out), "C20", "close NEGATIVO A3: BA-S46, S460, XS46 non valgono come S46 (parola intera)", `      exit=${g.code}`);
g = run([...cb("c-ba-ok"), "--session=BA-S45"]);
chk(g.code === 0 && /CLOSE PASS BA-S45/.test(g.out), "C21", "close positivo A3: prefisso nativo BA-S, next cita BA-S46", `      exit=${g.code}`);
g = run([...cb("c-ba-wrong"), "--session=BA-S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_STALE/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C22", "close NEGATIVO A3: prefisso BA-S, next cita solo S46", `      exit=${g.code}`);
g = run([...cb("c-next-s46a"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_STALE/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C23", "close NEGATIVO A3: S46a non vale come S46 (rilievo Codex 01a19b8c)", `      exit=${g.code}`);
g = run([...cb("c-next-dup"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_DUPLICATE/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C24", "close NEGATIVO A3: due campi next (il primo cita S46) = STOP, non vince il primo", `      exit=${g.code}`);
g = run([...cb("c-next-plainml"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C25", "close positivo A3: next senza virgolette su piu' righe, cominciato a capo", `      exit=${g.code}`);
g = run([...cb("c-next-literal"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C26", "close positivo A3: blocco letterale | con S46 nella seconda riga", `      exit=${g.code}`);
g = run([...cb("c-next-escape"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C27", "close positivo A3: S46 scritto con escape YAML \\x53\\x34\\x36 fra virgolette doppie", `      exit=${g.code}`);
g = run([...cb("c-next-badesc"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C28", "close NEGATIVO A3: escape non valido in YAML (\\S) = STOP, anche se il testo contiene S46", `      exit=${g.code}`);
g = run([...cb("c-next-bis"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C29", "close positivo A3: S46-bis vale (convenzione -bis dell'Empire)", `      exit=${g.code}`);
g = run([...cb("c-next-tab"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C30", "close NEGATIVO A3: tabulazione nel campo next = STOP (regola fail-closed dell'Empire: usare spazi)", `      exit=${g.code}`);
g = run([...cb("c-next-badind"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C31", "close NEGATIVO A3: indicatore di blocco |0 non valido in YAML", `      exit=${g.code}`);
g = run([...cb("c-next-space"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C32", "close positivo A3: chiave scritta 'next :' con spazio", `      exit=${g.code}`);
g = run([...cb("c-next-colon"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C33", "close NEGATIVO A3: ': ' in uno scalare senza virgolette (YAML non valido)", `      exit=${g.code}`);
g = run([...cb("c-next-aftercomment"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C34", "close NEGATIVO A3: S46 solo dopo un commento non fa parte di next", `      exit=${g.code}`);
g = run([...cb("c-shape-dq"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C35", "close NEGATIVO A3: next: S46 dentro una stringa aperta di un'altra chiave (per PyYAML next non esiste)", `      exit=${g.code}`);
g = run([...cb("c-shape-flow"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C36", "close NEGATIVO A3: next: S46 dentro una lista [ ] aperta di un'altra chiave", `      exit=${g.code}`);
g = run([...cb("c-shape-nokey"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_MISSING/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C37", "close NEGATIVO A3: riconoscimento della chiave: next:\"S46...\" senza spazio dopo i due punti non e' la chiave next (per YAML e' un'altra chiave)", `      exit=${g.code}`);
g = run([...cb("c-shape-indent"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C38", "close NEGATIVO A3: rientro incoerente in un'altra chiave (il roll-up PyYAML non legge il file)", `      exit=${g.code}`);
g = run([...cb("c-shape-real"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C39", "close positivo A3: file con liste, mappe annidate, blocco > e commenti (forma dei _status reali)", `      exit=${g.code}`);
g = run([...cb("c-next-bsl-stale"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_STALE/.test(g.out) && /"S46x: una riga/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C40", "close NEGATIVO A3: \\ a fine riga fra virgolette doppie unisce senza spazio: S46x non vale (rilievo Codex giro 4)", `      exit=${g.code}`);
g = run([...cb("c-next-bsl-ok"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C41", "close positivo A3: S4\\ + 6 fra virgolette doppie = S46, come PyYAML (rilievo Codex giro 4)", `      exit=${g.code}`);
g = run([...cb("c-shape-indentless"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C42", "close positivo A3: lista senza rientro sotto una chiave (YAML valido, rilievo Codex giro 4)", `      exit=${g.code}`);
g = run([...cb("c-ok-datejunk"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C43", "close NEGATIVO: date: 2026-01-02junk non e' una data (rilievo Codex giro 4, difetto della 1.19.0)", `      exit=${g.code}`);
g = run([...cb("c-ls-hash"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_STALE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C44", "close NEGATIVO: last_session: S45#junk e' un valore unico per YAML, non S45 + commento (rilievo Codex giro 5)", `      exit=${g.code}`);
g = run([...cb("c-dt-hash"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C45", "close NEGATIVO: date: 2026-01-02#junk non e' una data (rilievo Codex giro 5)", `      exit=${g.code}`);
g = run([...cb("c-key-space"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C46", "close positivo: chiavi scritte 'last_session :', 'date :' e 'next :' con spazio (YAML valido, rilievo Codex giro 5)", `      exit=${g.code}`);
g = run([...cb("c-dt-dup"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C47", "close NEGATIVO: date presente due volte (PyYAML terrebbe l'ultima) (rilievo Codex giro 5)", `      exit=${g.code}`);
g = run([...cb("c-dt-cal"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C48", "close NEGATIVO: date: 2026-02-31 non e' un giorno di calendario (PyYAML lo rifiuta) (rilievo Codex giro 5)", `      exit=${g.code}`);
g = run([...cb("c-shape-nestq"), "--session=S45"]);
chk(g.code === 0 && /CLOSE PASS S45/.test(g.out), "C49", "close positivo A3: continuazione di una stringa annidata poco rientrata: PyYAML 6.0.3 (versione del workflow del roll-up) la accetta, quindi passa (rilievo Codex giro 5 respinto con prova)", `      exit=${g.code}`);
g = run([...cb("c-next-ctrl"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C50", "close NEGATIVO A3: carattere di controllo (DEL) che il reader di PyYAML rifiuta (rilievo Codex giro 6: stesso caso del NUL)", `      exit=${g.code}`);
g = run([...cb("c-next-nel"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_NEXT_INVALID/.test(g.out) && (g.out.match(/CLOSE_STATUS_NEXT_/g) || []).length === 1, "C51", "close NEGATIVO A3: U+0085 e' un a capo per PyYAML (YAML 1.1): il valore non e' S46x", `      exit=${g.code}`);
g = run([...cb("c-ls-escape"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_STALE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C52", "close NEGATIVO dichiarato: last_session con escape YAML non e' letto (forma canonica: S45 senza escape); falso STOP voluto", `      exit=${g.code}`);
g = run([...cb("c-dt-year0"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C53", "close NEGATIVO: date: 0000-01-01, l'anno zero che Python/PyYAML rifiuta (rilievo Codex giro 7)", `      exit=${g.code}`);
g = run([...cb("c-dt-escape"), "--session=S45"]);
chk(g.code === 2 && /CLOSE_STATUS_DATE/.test(g.out) && !/CLOSE_STATUS_NEXT_/.test(g.out), "C54", "close NEGATIVO dichiarato: date con escape YAML non e' letta (forma canonica: 2026-01-02 senza escape); falso STOP voluto", `      exit=${g.code}`);

/* ---------- L9.13 / D-S214-1 (S215): "oggi" = giorno civile in EMPIRE_TZ, non l'ora della macchina ----------
 * TZ1-TZ3: la funzione con istanti FISSI (deterministici a ogni ora): mezzanotte CET e CEST, i due lati dei cambi
 * d'ora (01:00 UTC del 29/03 e del 25/10), fine anno; piu' il "domani" usato da TZ6. TZ4-TZ6: processi figli con il
 * fuso della macchina agli estremi (UTC-12, UTC, UTC+14), impostato con TZ SOLO nell'ambiente del figlio: l'orologio
 * NON e' falsificato. Ogni figlio dichiara il proprio scarto da UTC (getTimezoneOffset) e il test lo verifica: se una
 * piattaforma ignorasse TZ il test FALLISCE, non passa per il motivo sbagliato (rilievo Codex S215, punto 4).
 * Col vecchio calcolo (getDate locale) TZ6 fallisce a OGNI ora (UTC-12 e UTC+14 distano 26 ore: in ogni istante almeno uno
 * dei due ha un "oggi" diverso da Roma, quindi o accetta il domani o lo respinge col giorno sbagliato nel messaggio); TZ5
 * solo fra mezzanotte e le 13:00 di Roma (14:00 con l'ora legale), perche' il vecchio gate respinge solo date successive al
 * suo "oggi" (rilievo Codex S215, secondo giro). Il gate non legge alcuna variabile per forzare l'ora. */
const TZX = [["Etc/GMT+12", 720, "UTC-12"], ["UTC", 0, "UTC"], ["Etc/GMT-14", -840, "UTC+14"]];   /* Etc/GMT: segno invertito, nessuna ora legale */
const nextDay = (ymd) => { const [y, m, d] = ymd.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10); };
const POLICY_URL = JSON.stringify(pathToFileURL(join(SESSION_DIR, "policy.mjs")).href);
const childTz = (tz, ms) => JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e",
  `import { todayIn } from ${POLICY_URL}; const d = new Date(${ms}); console.log(JSON.stringify({ off: d.getTimezoneOffset(), today: todayIn(d) }))`],
  { encoding: "utf8", env: { ...process.env, TZ: tz } }));
{
  const cases = [["2026-10-18T23:30:17Z", "2026-10-19", "caso S214: 01:30 CEST"],
    ["2026-10-18T21:59:59Z", "2026-10-18", "23:59:59 CEST"], ["2026-10-18T22:00:00Z", "2026-10-19", "00:00:00 CEST"],
    ["2026-11-01T22:59:59Z", "2026-11-01", "23:59:59 CET"], ["2026-11-01T23:00:00Z", "2026-11-02", "00:00:00 CET"],
    ["2026-03-29T00:59:59Z", "2026-03-29", "01:59:59 CET, un secondo prima del passaggio all'ora legale"],
    ["2026-03-29T01:00:00Z", "2026-03-29", "03:00:00 CEST, subito dopo il passaggio"],
    ["2026-03-28T22:59:59Z", "2026-03-28", "23:59:59 CET del 28/03"], ["2026-03-28T23:00:00Z", "2026-03-29", "00:00:00 CET del 29/03"],
    ["2026-10-25T00:59:59Z", "2026-10-25", "02:59:59 CEST, un secondo prima del ritorno all'ora solare"],
    ["2026-10-25T01:00:00Z", "2026-10-25", "02:00:00 CET, subito dopo il ritorno"],
    ["2026-10-24T21:59:59Z", "2026-10-24", "23:59:59 CEST del 24/10"], ["2026-10-24T22:00:00Z", "2026-10-25", "00:00:00 CEST del 25/10"],
    ["2026-12-31T22:59:59Z", "2026-12-31", "fine anno, 23:59:59 CET"], ["2026-12-31T23:00:00Z", "2027-01-01", "capodanno, 00:00:00 CET"]];
  const bad = cases.map(([t, want, why]) => [t, want, todayIn(new Date(t)), why]).filter(([, want, d]) => d !== want);
  chk(EMPIRE_TZ === "Europe/Rome" && !bad.length, "TZ1", `todayIn: ${cases.length} istanti fissi -> giorno civile di Roma (mezzanotte CET/CEST, i due lati dei cambi d'ora, fine anno)`,
    bad.length ? bad.map(([t, w, d, why]) => `      ${t} (${why}): atteso ${w}, ottenuto ${d}`).join("\n") : undefined);
  const nd = [["2026-12-31", "2027-01-01"], ["2026-02-28", "2026-03-01"], ["2028-02-28", "2028-02-29"], ["2026-03-28", "2026-03-29"], ["2026-10-24", "2026-10-25"], ["2026-04-30", "2026-05-01"]];
  const ndBad = nd.filter(([a, b]) => nextDay(a) !== b);
  chk(!ndBad.length, "TZ1b", `"domani" dei test (nextDay): ${nd.length} casi (fine anno, febbraio normale e bisestile, notti dei cambi d'ora, fine mese)`,
    ndBad.length ? ndBad.map(([a, b]) => `      ${a}: atteso ${b}, ottenuto ${nextDay(a)}`).join("\n") : undefined);
  let e1 = null; try { todayIn(new Date(), "Mars/Base"); } catch (e) { e1 = e; }
  chk(e1 instanceof RangeError, "TZ2", "todayIn NEGATIVO: fuso inesistente -> errore, nessun ripiego sull'ora della macchina", `      ${e1 ? e1.constructor.name + ": " + e1.message : "nessun errore"}`);
  const fmt = todayIn();
  chk(/^\d{4}-\d{2}-\d{2}$/.test(fmt), "TZ3", "todayIn: formato YYYY-MM-DD con cifre latine", `      ${fmt}`);
  const s0 = Date.now(), w0 = todayIn(new Date(s0));
  const r4 = TZX.map(([tz, off, lab]) => { const c = childTz(tz, s0); return [lab, off, c, c.off === off && c.today === w0]; });
  chk(r4.every(x => x[3]), "TZ4", "todayIn indipendente dal fuso della macchina: figli a UTC-12, UTC, UTC+14 (scarto verificato) danno lo stesso giorno di Roma",
    r4.map(([lab, off, c, ok]) => `      ${lab}: scarto ${c.off} (atteso ${off}), oggi ${c.today} (atteso ${w0})${ok ? "" : "  <-- KO"}`).join("\n"));
  /* TZ7-TZ8: ambiente Intl degradato SIMULATO con un modulo precaricato (--import data:), sul gate reale e su fixture
   * statiche in sola lettura. Prova il ramo fail-closed della riga del gate: STOP con exit 2 (non 3, non 0). */
  const degr = (pre) => { try { return { out: execFileSync(process.execPath, ["--import", "data:text/javascript," + pre, GATE, ...cb("c-ok"), "--session=S45"], { encoding: "utf8" }), code: 0 }; }
    catch (e) { return { out: (e.stdout || "") + (e.stderr || ""), code: e.status }; } };
  const g7 = degr("delete Intl.DateTimeFormat");
  chk(g7.code === 2 && /oggi non calcolabile in Europe\/Rome: .*DateTimeFormat/.test(g7.out), "TZ7", "close NEGATIVO: Intl.DateTimeFormat assente -> STOP exit 2, nessun ripiego", `      exit=${g7.code}`);
  const g8 = degr('const F=Intl.DateTimeFormat;Intl.DateTimeFormat=function(l,o){const f=new F(l,o);const r=f.resolvedOptions.bind(f);f.resolvedOptions=()=>({...r(),timeZone:"Etc/UTC"});return f}');
  chk(g8.code === 2 && /risolto come Etc\/UTC/.test(g8.out), "TZ8", "close NEGATIVO: fuso risolto diverso da Europe/Rome (come con dati di fuso ridotti) -> STOP exit 2", `      exit=${g8.code}`);
}
if (!RUNS) { for (const id of ["TZ5", "TZ6"]) skipped(id, "gate reale con fuso macchina agli estremi", "--runs=<dir> non indicata"); }
else {
  const mk = (date) => { const dz = join(resolve(RUNS), "tz-" + date + "-" + new Date().toISOString().replace(/[:.]/g, "-"));
    cpSync(CX, dz, { recursive: true }); writeFileSync(join(dz, "c-ok.yaml"), `project: c-ok\nlast_session: S45\ndate: ${date}\nnext: "S46"\n`); return dz; };
  const runTz = (dz, tz) => { try { return { out: execFileSync(process.execPath, [GATE, `--root=${dz}`, `--index=${join(dz, "idx.yaml")}`, "--slug=c-ok", "--mode=close", "--session=S45"],
      { encoding: "utf8", env: { ...process.env, TZ: tz } }), code: 0 }; } catch (e) { return { out: (e.stdout || "") + (e.stderr || ""), code: e.status }; } };
  /* un giro completo; se fra inizio e fine e' scattata la mezzanotte a Roma, si ripete UNA volta (mai un PASS taciuto) */
  const round = () => {
    const today = todayIn(), tomorrow = nextDay(today), d5 = mk(today), d6 = mk(tomorrow);
    const res = TZX.map(([tz, off, lab]) => { const c = childTz(tz, Date.now()); return { lab, off, seen: c.off, r5: runTz(d5, tz), r6: runTz(d6, tz) }; });
    return { today, tomorrow, d5, d6, res, crossed: todayIn() !== today };
  };
  let R = round(); if (R.crossed) { console.log("      mezzanotte di Roma attraversata durante TZ5-TZ6: giro ripetuto"); R = round(); }
  const offOk = R.res.every(x => x.seen === x.off);
  const line = (x, r) => `      ${x.lab}: scarto ${x.seen} (atteso ${x.off}), exit=${r.code}`;
  chk(!R.crossed && offOk && R.res.every(x => x.r5.code === 0 && /CLOSE PASS S45/.test(x.r5.out)), "TZ5",
    `close positivo: date = oggi a Roma (${R.today}) accettata con la macchina a UTC-12, UTC e UTC+14 (scarto verificato)`, R.res.map(x => line(x, x.r5)).join("\n"));
  chk(!R.crossed && offOk && R.res.every(x => x.r6.code === 2 && /CLOSE_STATUS_DATE/.test(x.r6.out) && /nel futuro/.test(x.r6.out) && x.r6.out.includes(`(oggi ${R.today})`)), "TZ6",
    `close NEGATIVO: date = domani a Roma (${R.tomorrow}) rifiutata come futuro, con "oggi ${R.today}" nel messaggio, a UTC-12, UTC e UTC+14`, R.res.map(x => line(x, x.r6)).join("\n"));
  console.log(`  artefatti TZ conservati: ${R.d5} · ${R.d6}`);
}

/* R9 (statico): progetto bootstrap senza registro e senza cartella receipts -> CHAIN_WITHOUT_RECEIPTS, exit 0 (F3: prima della policy) */
{
  const R9 = join(FX, "receipt");
  const g9 = run([`--root=${R9}`, `--index=${join(R9, "idx.yaml")}`, "--slug=r-boot", "--mode=receipt"]);
  chk(g9.code === 0 && /CHAIN_WITHOUT_RECEIPTS/.test(g9.out) && /"dirExists":false/.test(g9.out), "R9", "bootstrap senza registro ne' cartella: transizione, exit 0 (non NO_AUTHORITATIVE_SOURCE)", `      exit=${g9.code}`);
  const g9b = run([`--root=${R9}`, `--index=${join(R9, "idx.yaml")}`, "--slug=r-hold", "--mode=receipt"]);
  chk(g9b.code === 0 && /CHAIN_WITHOUT_RECEIPTS/.test(g9b.out), "R9b", "hold-migration senza ricevute: receipt risponde (informativo) e non applica la policy di apertura", `      exit=${g9b.code}`);
}

if (!RUNS) { for (const id of ["G1","G2","G3","G4","G5","O1","O2","O3","O4","O5","R1","R2","R3","R4","R5","R6","R7","R8"]) skipped(id, "caso receipt", "--runs=<dir> non indicata"); }
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

  /* ---------- --mode=receipt (S211, D13 Empire-wide — S210 design 5.2/7-ter): ricevuta di pubblicazione ----------
   * Repo git REALI in --runs (serve `tracked` e `ancestor`). Registri generati qui, senza designatori nella prosa (LL-091). */
  const gitq = (cwd, args) => execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } }).trim();
  const REG = (pfx) => `<!-- STATO NUMERAZIONE -->\nULTIMO NUMERO OCCUPATO : ${pfx}45\nULTIMA SESSIONE CHIUSA : ${pfx}45\nPROSSIMO NUMERO LIBERO : ${pfx}46\n\n## 2026-01-02 | Tipo A | ${pfx}45 — chiusa\n\ntesto\n`;
  const IDX = (slug, pfx, gate, extra) => `projects:\n  - slug: ${slug}\n    repo: repo\n    session_log: reg.md\n    briefings: brief\n    session_prefix: "${pfx}"\n    branch: dev\n    swe_writes: true\n    session_gate: ${gate}\n${extra || ""}`;
  const mkRepo = (d, slug, pfx, gate, withReg = true) => {
    mkdirSync(join(d, "repo", "_session", "receipts"), { recursive: true }); mkdirSync(join(d, "brief"), { recursive: true });
    writeFileSync(join(d, "idx.yaml"), IDX(slug, pfx || "", gate));
    gitq(join(d, "repo"), ["init", "-q", "-b", "dev"]);
    if (withReg) { writeFileSync(join(d, "repo", "reg.md"), REG(pfx || "S")); gitq(join(d, "repo"), ["add", "reg.md"]); gitq(join(d, "repo"), ["commit", "-q", "-m", "chiusura"]); }
    return withReg ? gitq(join(d, "repo"), ["rev-parse", "HEAD"]) : null;
  };
  const REC = (slug, S, head, remote) => JSON.stringify({ kind: "session-close", project: slug, session: S, branch: "dev", head, remote: remote ?? head, message: "chiusura", files: ["reg.md"], pc: "TEST", publishedAt: "2026-01-02T00:00:00+00:00", tool: "test" }, null, 1);
  const rr = (d, slug) => run([`--root=${d}`, `--index=${join(d, "idx.yaml")}`, `--slug=${slug}`, "--mode=receipt"]);
  const stamp = () => new Date().toISOString().replace(/[:.]/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
  /* R1 PASS: ricevuta coerente, tracciata, head nella storia */
  let dR = join(resolve(RUNS), "rcpt-R1-" + stamp()); let h = mkRepo(dR, "p-r", "", "enforce");
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S45_CLOSE.json"), REC("p-r", "S45", h));
  gitq(join(dR, "repo"), ["add", "_session/receipts/p-r_S45_CLOSE.json"]); gitq(join(dR, "repo"), ["commit", "-q", "-m", "ricevuta"]);
  const i1 = inv(join(dR, "repo", "_session", "receipts"));
  g = rr(dR, "p-r");
  chk(g.code === 0 && /RECEIPT PASS S45/.test(g.out) && /"tracked":true/.test(g.out) && /"ancestor":true/.test(g.out) && inv(join(dR, "repo", "_session", "receipts")) === i1, "R1", "receipt PASS: coerente, tracciata, head antenato di HEAD; receipts invariati", `      exit=${g.code}`);
  /* R2 NOT_PUBLISHED: head != remote */
  dR = join(resolve(RUNS), "rcpt-R2-" + stamp()); h = mkRepo(dR, "p-r", "", "enforce");
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S45_CLOSE.json"), REC("p-r", "S45", h, "0".repeat(40)));
  gitq(join(dR, "repo"), ["add", "-A", "_session"]); gitq(join(dR, "repo"), ["commit", "-q", "-m", "ricevuta"]);
  g = rr(dR, "p-r");
  chk(g.code === 2 && /NOT_PUBLISHED S45/.test(g.out) && /head .* != remote/.test(g.out), "R2", "receipt NEGATIVO: head != remote -> chiusa ma NON pubblicata", `      exit=${g.code}`);
  /* R3 NOT_PUBLISHED: file dell'ultima chiusa assente, ma la catena e' nel regime (c'e' una ricevuta precedente) */
  dR = join(resolve(RUNS), "rcpt-R3-" + stamp()); h = mkRepo(dR, "p-r", "", "enforce");
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S44_CLOSE.json"), REC("p-r", "S44", h));
  g = rr(dR, "p-r");
  chk(g.code === 2 && /NOT_PUBLISHED S45/.test(g.out) && /assente/.test(g.out), "R3", "receipt NEGATIVO: ricevuta dell'ultima chiusa assente con catena nel regime", `      exit=${g.code}`);
  /* R4 CHAIN_WITHOUT_RECEIPTS: cartella presente ma senza ricevute di chiusura (solo receipt di apertura) */
  dR = join(resolve(RUNS), "rcpt-R4-" + stamp()); h = mkRepo(dR, "p-r", "", "enforce");
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S45.json"), "{}");
  g = rr(dR, "p-r");
  chk(g.code === 0 && /CHAIN_WITHOUT_RECEIPTS/.test(g.out) && /"dirExists":true/.test(g.out), "R4", "transizione: nessuna _CLOSE.json (solo receipt di apertura) -> exit 0, non bloccante", `      exit=${g.code}`);
  /* R5 NO_AUTHORITATIVE_SOURCE: catena nel regime ma registro senza blocco */
  dR = join(resolve(RUNS), "rcpt-R5-" + stamp()); h = mkRepo(dR, "p-r", "", "enforce");
  writeFileSync(join(dR, "repo", "reg.md"), readFileSync(join(FX, "f4_crescente.md"), "utf8"));
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S45_CLOSE.json"), REC("p-r", "S45", h));
  g = rr(dR, "p-r");
  chk(g.code === 2 && /NO_AUTHORITATIVE_SOURCE/.test(g.out), "R5", "receipt NEGATIVO: ricevute presenti ma registro senza blocco -> ultima chiusa indeterminabile", `      exit=${g.code}`);
  /* R6 prefisso nativo BA-S: nome file bot_BA-S45_CLOSE.json */
  dR = join(resolve(RUNS), "rcpt-R6-" + stamp()); h = mkRepo(dR, "p-ba", "BA-S", "enforce");
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-ba_BA-S45_CLOSE.json"), REC("p-ba", "BA-S45", h));
  gitq(join(dR, "repo"), ["add", "-A", "_session"]); gitq(join(dR, "repo"), ["commit", "-q", "-m", "ricevuta"]);
  g = rr(dR, "p-ba");
  chk(g.code === 0 && /RECEIPT PASS BA-S45/.test(g.out), "R6", "prefisso nativo BA-S: ricevuta <slug>_BA-S<n>_CLOSE.json riconosciuta", `      exit=${g.code}`);
  /* R7 NOT_PUBLISHED: ricevuta valida ma NON tracciata (F2: parita' dual-PC) */
  dR = join(resolve(RUNS), "rcpt-R7-" + stamp()); h = mkRepo(dR, "p-r", "", "enforce");
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S45_CLOSE.json"), REC("p-r", "S45", h));
  g = rr(dR, "p-r");
  chk(g.code === 2 && /NOT_PUBLISHED S45/.test(g.out) && /NON committata/.test(g.out), "R7", "receipt NEGATIVO: ricevuta coerente ma untracked -> non viaggia col repo", `      exit=${g.code}`);
  /* R8 NOT_PULLED: ricevuta tracciata ma head non antenato di HEAD (PC indietro / storia diversa) */
  dR = join(resolve(RUNS), "rcpt-R8-" + stamp()); h = mkRepo(dR, "p-r", "", "enforce");
  const fakeHead = "f".repeat(39) + "0";
  writeFileSync(join(dR, "repo", "_session", "receipts", "p-r_S45_CLOSE.json"), REC("p-r", "S45", fakeHead));
  gitq(join(dR, "repo"), ["add", "-A", "_session"]); gitq(join(dR, "repo"), ["commit", "-q", "-m", "ricevuta"]);
  g = rr(dR, "p-r");
  chk(g.code === 2 && /NOT_PULLED S45/.test(g.out) && /pull-first/.test(g.out), "R8", "receipt NEGATIVO: chiusura pubblicata ma non nella storia locale -> NOT_PULLED (rimedio pull, non ripubblicare)", `      exit=${g.code}`);
  console.log(`  artefatti receipt conservati sotto: ${resolve(RUNS)}/rcpt-*`);
  console.log(`\n  artefatti conservati: ${dir}`);
}
console.log(`\nRISULTATO: ${pass} PASS / ${fail} FAIL / ${skip} SKIP su ${pass + fail + skip}  ·  ${process.platform}`);
process.exit(fail ? 1 : 0);
