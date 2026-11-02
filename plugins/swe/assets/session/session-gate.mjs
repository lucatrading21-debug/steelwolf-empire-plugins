#!/usr/bin/env node
/* session-gate — ENTRYPOINT UNICO. Legge index + slug, applica la policy, esegue il gate.
 * L'istanza passa root e slug: non risolve percorsi, non sceglie la policy, non compone la decisione.
 *   --mode=check   PRE-CARD, read-only assoluto (a sessione gia aperta con prova: OPEN S<n>, S209)
 *   --mode=commit  POST-CONFERMA, receipt esclusivo
 *   --mode=verify  ricontrollo del receipt (identita completa + rilettura)
 *   --mode=close   IN CHIUSURA, read-only: prova che il registro dichiara S<n> chiusa (S209, D13)
 *                  + il file _status/<slug>.yaml dell'Hub dichiara S<n> (S214, A1-bis, ADR-029)
 *                  + il suo campo `next` cita S<n+1> (S215, A3 / L9.17)
 *   --mode=receipt PRE-CARD, read-only: ricevuta di pubblicazione dell'ULTIMA SESSIONE CHIUSA (S211, D13 Empire-wide)
 * exit 0 PASS · 2 STOP · 3 uso errato. (c) 2026 Luke SteelWolf. */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve as resolvePath } from "node:path";
import { createHash } from "node:crypto";
import { nextSession, headingNumbers } from "./swe-next-session.mjs";
import { resolveBriefings } from "./briefings.mjs";
import { resolveProject, todayIn, EMPIRE_TZ } from "./policy.mjs";
const A = (k, d) => { const a = process.argv.find(v => v.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const sha = (s) => createHash("sha256").update(s).digest("hex");
/* L9.17 (S215, rev. dopo revisione Codex 01a19b8c): campo di primo livello `next` di un _status/<slug>.yaml.
 * Lettore YAML RISTRETTO, progettato fail-closed (il plugin non ha dipendenze npm): cio' che non sa leggere e' STOP.
 * Confrontato con PyYAML 6.0.3 (scripts/fuzz-next); non e' una prova formale di equivalenza. Restituisce { kind: "ok", value } | { kind: "missing" } | { kind: "duplicate", lines } |
 * { kind: "invalid", why }. Forme lette: scalare semplice anche su piu' righe (commento ` #` escluso), "..." con gli
 * escape YAML (escape sconosciuto = invalid), '...' con '', blocco > | con indicatori YAML ([1-9] e +/-), `next :`.
 * Non lette (invalid): alias/ancore/tag/flow ( * & ! [ { ), virgolette non chiuse, testo dopo la chiusura.
 * Dopo aver letto `next`, shapeOf controlla la forma del file intero (S215, dopo il fuzzing contro PyYAML):
 * una riga `next: S46` puo' essere il seguito di una stringa "..." o di una lista [...] di un'altra chiave, e allora
 * per PyYAML non e' una chiave; un file con rientri incoerenti non lo legge nemmeno il roll-up. shapeOf ammette:
 * mappa piana di primo livello, liste e mappe a blocco annidate con rientri coerenti, stringhe "..." '...' (anche su
 * piu' righe rientrate, escape validati), blocchi | > , liste in linea semplici ([] {} [a, b]), commenti, un solo
 * `---` iniziale e un `...` finale. Tutto il resto (tab, ancore, alias, tag, chiavi complesse, direttive %) = invalid.
 * Non e' un validatore YAML completo: e' un sottoinsieme sicuro, confrontato con PyYAML safe_load. */
function shapeOf(L) {
  const at = (i, why) => `riga ${i + 1}: ${why}`;
  const ESC = /^(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|[0abtnvfre "\/\\N_LP])/;
  const eat = (t, q) => { for (let k = 0; k < t.length; k++) {   /* indice della chiusura, -1 aperta, -2 escape non valido */
    if (q === '"' && t[k] === "\\") { const r = t.slice(k + 1); if (r === "") return -1; const m = r.match(ESC); if (!m) return -2; k += m[0].length; continue; }
    if (q === "'" && t[k] === "'" && t[k + 1] === "'") { k++; continue; }
    if (t[k] === q) return k; } return -1; };
  const tail = (r) => /^[ ]*(#.*)?$/.test(r);
  const KEY = /^(?!(?:---|\.\.\.)(?: |$))(?![-?:](?: |$)|[&*!|>%@`'"\[\]{},#])((?:[^ :#]|:(?! |$)| (?!#)|(?<! )#)*?)[ ]*:(?=[ ]|$)/;   /* chiave semplice YAML senza virgolette */
  let seen = false, dash = false, ended = false;
  let q = null, qi = 0, blk = -1, bind = 0, bpre = 0, mode = null, own = 0, stack = [];
  /* lista/mappa in linea: solo le forme semplici su una riga ([] {} [a, b]); il resto va scritto a blocco */
  const FLOW = /^(\[ *\]|\{ *\}|\[ *[^ ,:\[\]{}#'"&*!?|>%@`-][^,:\[\]{}#'"]*?( *, *[^ ,:\[\]{}#'"&*!?|>%@`-][^,:\[\]{}#'"]*?)* *,? *\])/;
  const fl = (t, i) => { const m = t.match(FLOW);
    if (!m) return at(i, "lista/mappa in linea [ ] { } non semplice: scriverla in forma a blocco (una voce per riga con -)");
    mode = "done"; return tail(t.slice(m[0].length)) ? null : at(i, "testo dopo la chiusura di una lista/mappa [ ] { }"); };
  let ownKey = false;
  const value = (v, i, o, isKey) => {   /* v = testo dopo "chiave:" o dopo "- " ; o = colonna del proprietario */
    own = o; ownKey = isKey; v = v.replace(/^ +/, "");
    if (v === "" || v.startsWith("#")) { mode = "open"; return null; }
    const c = v[0];
    if (c === '"' || c === "'") { const k = eat(v.slice(1), c);
      if (k === -2) return at(i, "escape non valido fra virgolette doppie");
      if (k < 0) { q = c; qi = i; mode = null; return null; }
      mode = "done"; return tail(v.slice(k + 2)) ? null : at(i, "testo dopo la chiusura di una stringa fra virgolette"); }
    if (c === "[" || c === "{") return fl(v, i);
    if (c === "|" || c === ">") { if (!/^[>|]([1-9][+-]?|[+-][1-9]?)?([ ]+#.*)?[ ]*$/.test(v)) return at(i, `indicatore di blocco non valido: "${v}"`);
      const dg = v.match(/^[>|][+-]?([1-9])/); blk = o; bind = dg ? o + Number(dg[1]) : 0; bpre = 0; mode = null; return null; }
    if (/^[&*!?%@`,\]}]/.test(c) || /^-( |$)/.test(v)) return at(i, `forma YAML non supportata dal gate (inizia con "${c}")`);
    const cm = v.search(/(^|[ ])#/), txt = cm < 0 ? v : v.slice(0, cm);
    if (/:( |$)/.test(txt)) return at(i, "': ' in un valore senza virgolette (YAML non valido)");
    mode = cm < 0 ? "plain" : "done"; return null;
  };
  for (let i = 0; i < L.length; i++) {
    const l = L[i], blank = l.trim() === "", ind = l.match(/^ */)[0].length;
    if (l.includes("\t")) return at(i, "tabulazione nel file: usare spazi (regola Empire; YAML vieta i tab nei rientri)");
    if (q) {
      if (blank) continue;
      if (ind === 0) return at(qi, "stringa fra virgolette non chiusa prima della chiave successiva");
      const k = eat(l, q); if (k === -2) return at(i, "escape non valido fra virgolette doppie"); if (k < 0) continue;
      q = null; mode = "done"; if (!tail(l.slice(k + 1))) return at(i, "testo dopo la chiusura di una stringa fra virgolette"); continue;
    }
    if (blk >= 0) {   /* blocco | > : rientro fissato dalla prima riga non vuota (o dalla cifra), come in YAML */
      if (blank) { if (!bind) bpre = Math.max(bpre, l.length); continue; }
      if (!bind && ind > blk) { if (bpre > ind) return at(i, "riga vuota iniziale del blocco piu' rientrata del testo"); bind = ind; continue; }
      if (bind && ind >= bind) continue;
      if (ind > blk && !/^ *#/.test(l)) return at(i, "riga del blocco | > meno rientrata della prima (YAML non valido)");
      blk = -1;
    }
    if (blank) continue;
    if (/^ *#/.test(l)) { if (mode === "plain") mode = "done"; continue; }
    if (ind > 0 || /^-( |$)/.test(l)) {   /* righe rientrate, e voci "- " a colonna 0 (lista senza rientro sotto una chiave) */
      if (!seen) return at(i, "riga rientrata prima di ogni chiave");
      if (mode === "plain" && ind > own) { const t = l.trim(), cm = t.search(/(^|[ ])#/), x = cm < 0 ? t : t.slice(0, cm);
        if (/:( |$)/.test(x)) return at(i, "': ' in un valore senza virgolette (YAML non valido)");
        if (cm >= 0) mode = "done"; continue; }
      if (mode === "done" && ind > own) return at(i, "testo rientrato dopo un valore gia' chiuso (YAML non valido)");
      let r = l.slice(ind), col = ind, o = ind;
      const isDash = /^-( |$)/.test(r);
      if (mode === "open" && ind > own && !isDash && !KEY.test(r)) { const e = value(r, i, own, false); if (e) return e; continue; }   /* valore cominciato a capo */
      if (mode === "open" && ind > own) stack.push({ ind, seq: isDash });
      else if (mode === "open" && ownKey && ind === own && isDash) stack.push({ ind, seq: true, il: true });   /* lista senza rientro (YAML la ammette sotto una chiave) */
      else {
        while (stack.length && (stack[stack.length - 1].ind > ind || (stack[stack.length - 1].il && stack[stack.length - 1].ind === ind && !isDash))) stack.pop();
        const top = stack[stack.length - 1];
        if (!top || top.ind !== ind) return at(i, "rientro incoerente con le righe sopra (YAML non valido)");
        if (top.seq !== isDash) return at(i, isDash ? "voce di lista dove ci si aspetta una chiave" : "chiave o testo dove ci si aspetta una voce di lista");
      }
      mode = null;
      while (/^-( |$)/.test(r)) { const sp = r.slice(1).match(/^ */)[0].length; o = col; col += 1 + sp; r = r.slice(1 + sp);
        if (/^-( |$)/.test(r)) stack.push({ ind: col, seq: true }); }
      const km = r.match(KEY);
      if (km) { if (col !== ind) stack.push({ ind: col, seq: false }); o = col; r = r.slice(km[0].length); }
      else if (col === ind) return at(i, "riga rientrata che non e' ne' una chiave semplice ne' una voce di lista");
      const e = value(r, i, o, !!km); if (e) return e; continue;
    }
    if (ended) return at(i, "contenuto dopo la fine del documento (...)");
    if (/^---([ ]+#.*)?[ ]*$/.test(l) && !seen && !dash) { dash = true; continue; }
    if (/^\.\.\.([ ]+#.*)?[ ]*$/.test(l)) { ended = true; continue; }
    const m = l.match(new RegExp(KEY.source + "(.*)$"));
    if (!m) return at(i, "riga di primo livello che non e' una chiave semplice (il file deve essere una mappa YAML piana)");
    seen = true; mode = null; blk = -1; bind = 0; stack = [{ ind: 0, seq: false }];
    const e = value(m[2], i, 0, true); if (e) return e;
  }
  if (q) return at(qi, "stringa fra virgolette non chiusa a fine file");
  return null;
}
function readNext(st) {   /* prima i caratteri, poi il campo next (messaggi propri), poi la forma del file intero */
  /* caratteri che il reader di PyYAML rifiuta (ReaderError: NUL, controlli, surrogati soli; rilievo Codex giro 6 di S215) e gli
   * a capo YAML 1.1 non standard (U+0085, U+2028, U+2029), che PyYAML tratta come fine riga; U+FEFF dentro il file (il BOM
   * iniziale e' gia' tolto), che per JavaScript e' uno spazio e per PyYAML no */
  const np = st.search(/[^\t\n\r\x20-\x7E\xA0-\u2027\u202A-\uD7FF\uE000-\uFEFE\uFF00-\uFFFD\u{10000}-\u{10FFFF}]/u);
  if (np >= 0) return { kind: "invalid", why: `riga ${st.slice(0, np).split("\n").length}: carattere non ammesso in YAML (codice ${st.codePointAt(np).toString(16).toUpperCase().padStart(4, "0")})` };
  const r = readNext0(st);
  if (r.kind !== "ok") return r;
  const sh = shapeOf(st.split(/\r?\n/));
  return sh ? { kind: "invalid", why: sh } : r;
}
function readNext0(st) {
  const L = st.split(/\r?\n/), at = [];
  L.forEach((l, i) => { if (/^next[ \t]*:(?=[ \t]|$)/.test(l)) at.push(i); });
  if (!at.length) return { kind: "missing" };
  if (at.length > 1) return { kind: "duplicate", lines: at.map(i => i + 1) };
  const i = at[0], raw = [];
  for (let j = i + 1; j < L.length && (L[j].trim() === "" || /^[ \t]/.test(L[j])); j++) raw.push(L[j]);
  const v = L[i].replace(/^next[ \t]*:[ \t]*/, ""), cont = raw.map(x => x.trim());
  const bad = (why) => ({ kind: "invalid", why: `riga ${i + 1} (next): ${why}` });
  const ok = (x) => ({ kind: "ok", value: x.replace(/\s+/g, " ").trim() });
  /* il roll-up (empire_rollup.py) legge questi file con PyYAML: un tab qui lo farebbe fallire, quindi il gate si ferma */
  if (/\t/.test(L[i]) || raw.some(x => /\t/.test(x))) return bad("tabulazione nel campo next: usa spazi");
  if (/^[>|]/.test(v)) {
    if (!/^[>|]([1-9][+-]?|[+-][1-9]?)?([ ]+#.*)?[ ]*$/.test(v)) return bad(`indicatore di blocco non valido: "${v}"`);
    const dig = (v.match(/^[>|][+-]?([1-9])/) || [])[1], k0 = raw.findIndex(x => x.trim() !== "");
    const ind = dig ? Number(dig) : (k0 < 0 ? 0 : raw[k0].match(/^ */)[0].length);   /* indicatore esplicito = rientro richiesto */
    if (raw.slice(0, k0 < 0 ? raw.length : k0).some(x => x.length > ind)) return bad("riga vuota iniziale del blocco piu' rientrata del testo");
    const txt = [];
    let end = false;
    for (const x of raw) {
      if (x.trim() === "") continue;
      if (!end && x.match(/^ */)[0].length >= ind) { txt.push(x.trim()); continue; }
      if (/^ *#/.test(x)) { end = true; continue; }   /* riga meno rientrata che e' solo commento: chiude il blocco */
      return bad("righe del blocco meno rientrate della prima");
    }
    return ok(txt.join(" "));
  }
  if (/^["']/.test(v)) {
    /* piegatura YAML delle righe: a capo = spazio; in "..." una riga che finisce con \ (numero dispari) si unisce SENZA spazio
     * (rilievo Codex giro 4: "S46\ + x" e' S46x per PyYAML, non "S46 x") */
    let all = v;
    for (const x of raw) { const y = x.replace(/^[ ]+/, "");
      if (v[0] === '"' && /(^|[^\\])(\\\\)*\\$/.test(all)) all = all.slice(0, -1) + y;
      else all = all.replace(/[ ]+$/, "") + " " + y; }
    const m = v[0] === '"' ? all.match(/^"((?:[^"\\]|\\.)*)"(.*)$/s) : all.match(/^'((?:[^']|'')*)'(.*)$/s);
    if (!m) return bad("virgolette non chiuse");
    if (!/^ *(#.*)?$/.test(m[2])) return bad(`testo dopo la chiusura delle virgolette: "${m[2].trim().slice(0, 40)}"`);
    if (v[0] === "'") return ok(m[1].replace(/''/g, "'"));
    const E = { "0": "\0", a: "\x07", b: "\b", t: "\t", n: "\n", v: "\v", f: "\f", r: "\r", e: "\x1b", " ": " ", '"': '"', "/": "/", "\\": "\\", N: "\x85", _: "\xa0", L: " ", P: " " };
    let esc = null;
    const out = m[1].replace(/\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|.)/gs, (_, e) => {
      if (e.length > 1) { const cp = parseInt(e.slice(1), 16); if (cp > 0x10ffff) { esc = esc || e; return ""; } return String.fromCodePoint(cp); }
      if (e in E) return E[e]; esc = esc || e; return "";
    });
    return esc === null ? ok(out) : bad(`escape non valido in YAML: \\${esc}`);
  }
  /* scalare semplice: puo' cominciare sulla riga dopo (riga di next vuota o solo commento) */
  const first = /^#/.test(v) ? "" : v, parts = [];
  let ended = false;
  for (const x of [first, ...cont]) {
    if (ended) { if (x !== "" && !/^#/.test(x)) return bad("testo dopo un commento: in YAML non fa parte di next"); continue; }
    if (x === "") continue;
    if (/^#/.test(x)) { ended = true; continue; }
    const c = x.search(/ #/);
    if (c >= 0) { parts.push(x.slice(0, c)); ended = true; continue; }
    parts.push(x);
  }
  const val = parts.join(" ");
  if (/^([-?:]( |$)|[*&!\[\]{}%@`|>"',])/.test(val)) return bad(`forma YAML non supportata dal gate o non valida (indicatore iniziale): "${val.slice(0, 40)}"`);
  if (/:( |$)/.test(val)) return bad("': ' dentro uno scalare senza virgolette (YAML non valido): metti il testo fra virgolette");
  return ok(val);
}
const die = (c, l) => { console.error("SESSION GATE: STOP\n" + l.map(x => "  · " + x).join("\n")); process.exit(c); };
const mode = A("mode", "check");
if (!["check", "commit", "verify", "close", "receipt"].includes(mode)) die(3, [`--mode="${mode}": check | commit | verify | close | receipt`]);
const root = A("root"), slug = A("slug");
if (!root || !slug) die(3, ["--root e --slug sono obbligatori"]);
const P = resolveProject(root, slug, A("index", null));
if (P.error) die(2, [P.error]);

/* --mode=receipt (S211, D13 Empire-wide — S210_D13_EMPIRE_DESIGN sez. 5.2 + 7-ter F2/F3). PRE-CARD, READ-ONLY.
 * Applica start §0-ter.4-e per slug: la ricevuta di pubblicazione dell'ULTIMA SESSIONE CHIUSA e' una decisione della
 * macchina, non una lettura in prosa. ORDINE (F3): prima la catena (nessuna <slug>_*_CLOSE.json -> transizione, exit 0),
 * poi il blocco, poi il file. Gira PRIMA della policy hold-migration: e' informativo, non apre nulla.
 * Esiti: PASS 0 · CHAIN_WITHOUT_RECEIPTS 0 · PASS_UNVERIFIED_GIT 0 · NOT_PUBLISHED 2 · NOT_PULLED 2 · NO_AUTHORITATIVE_SOURCE 2 */
if (mode === "receipt") {
  const rdir = join(P.repoPath, "_session", "receipts");
  const mine = (n) => n.toLowerCase().startsWith((P.slug + "_").toLowerCase()) && n.toLowerCase().endsWith("_close.json");
  const closes = existsSync(rdir) ? readdirSync(rdir).filter(mine) : [];
  const say = (verdict, code, extra) => {
    console.log(`SESSION GATE: RECEIPT ${verdict}${extra && extra.session ? " " + extra.session : ""} — ${P.slug} (mode=receipt READ-ONLY: nessun file creato o modificato)`);
    console.log(JSON.stringify({ project: P.slug, prefix: P.prefix, policy: P.gate, mode: "receipt", verdict, receiptsDir: rdir, ...extra }));
    process.exit(code);
  };
  if (!closes.length) say("CHAIN_WITHOUT_RECEIPTS", 0, { dirExists: existsSync(rdir), note: "transizione D13: la catena non ha ancora una ricevuta di chiusura; non retroattivo, non bloccante" });
  const rex = existsSync(P.registry), rtx = rex ? readFileSync(P.registry, "utf8") : "";
  const c = nextSession(rtx, { prefix: P.prefix, briefings: resolveBriefings(P.briefings), registryExists: rex, bootstrap: P.bootstrap });
  if (c.source !== "block" || !c.lastClosed) die(2, [`RECEIPT NO_AUTHORITATIVE_SOURCE — ${P.slug}: la catena ha ricevute (${closes.length}) ma il registro non ha un blocco STATO NUMERAZIONE leggibile (fonte=${c.source}): l'ultima sessione chiusa non e' determinabile`]);
  const S = c.lastClosed, want = `${P.slug}_${S}_CLOSE.json`;
  const hit = readdirSync(rdir).find(n => n.toLowerCase() === want.toLowerCase());
  const bad = [];
  if (!hit) bad.push(`ricevuta ${want} assente in ${rdir} (ricevute presenti: ${closes.join(", ")})`);
  let rec = null, rp = hit ? join(rdir, hit) : null;
  if (hit) { try { rec = JSON.parse(readFileSync(rp, "utf8")); } catch (e) { bad.push(`ricevuta illeggibile: ${e.message}`); } }
  if (rec) {
    if (rec.kind !== "session-close") bad.push(`kind "${rec.kind}", atteso "session-close"`);
    if (rec.project !== P.slug) bad.push(`project "${rec.project}", atteso "${P.slug}"`);
    if (rec.session !== S) bad.push(`session "${rec.session}", attesa "${S}"`);
    if (P.branch && rec.branch !== P.branch) bad.push(`branch "${rec.branch}", atteso "${P.branch}" (index)`);
    if (!/^[0-9a-f]{40}$/.test(String(rec.head || ""))) bad.push(`head non e' uno sha a 40 hex`);
    else if (rec.head !== rec.remote) bad.push(`head ${rec.head} != remote ${rec.remote}: pubblicazione non dimostrata`);
  }
  if (bad.length) die(2, [`RECEIPT NOT_PUBLISHED ${S} — ${P.slug}: "${S} chiusa ma NON pubblicata". Prima priorita' obbligata: pubblicarla (manifest + swe-publish.ps1 -Kind close).`, ...bad]);
  /* git: tracciata (F2, parita' dual-PC) e head antenato di HEAD (F3, PC indietro). Read-only, mai un lock. */
  const env = { ...process.env, GIT_OPTIONAL_LOCKS: "0" };
  const git = (args) => { try { execFileSync("git", ["-C", P.repoPath, ...args], { stdio: "ignore", env }); return true; } catch (e) { return e && e.code === "ENOENT" ? null : false; } };
  const tracked = git(["ls-files", "--error-unmatch", "--", rp]);
  if (tracked === null) say("PASS_UNVERIFIED_GIT", 0, { session: S, receipt: rp, head: rec.head, note: "git non eseguibile: ricevuta coerente, ma tracciamento e antenato NON verificati" });
  if (tracked === false) die(2, [`RECEIPT NOT_PUBLISHED ${S} — ${P.slug}: ricevuta presente ma NON committata (${rp}). Il secondo push del publisher e' mancato o e' una ricevuta v1: committala (swe-publish.ps1 -Kind work con manifest = la ricevuta).`]);
  const anc = git(["merge-base", "--is-ancestor", rec.head, "HEAD"]);
  if (anc === false) die(2, [`RECEIPT NOT_PULLED ${S} — ${P.slug}: la chiusura ${rec.head.slice(0, 7)} e' pubblicata ma NON e' nella storia locale: questo PC e' indietro. Rimedio: pull-first (SESSION_PROTOCOL §2.2), non ripubblicare.`]);
  say("PASS", 0, { session: S, receipt: rp, head: rec.head, branch: rec.branch, tracked: true, ancestor: true });
}

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
/* --mode=close (S209, D13 — S208_D13_DESIGN sez. 3). Gira in swe:end DOPO aver scritto log e blocco
 * e PRIMA del manifest di pubblicazione. READ-ONLY come check: non crea e non modifica nulla.
 * Passa solo se il registro appena scritto DIMOSTRA la chiusura di S<n>: fonte = blocco,
 * OCCUPATO = CHIUSA = S<n>, PROSSIMO = S<n+1>, briefing S<n>_OPEN.md presente, intestazione
 * `## ... S<n>` nel log vivo, nessun blocco strutturale di nextSession (sospensione inclusa).
 * Causa (S206): aggiornare il blocco dipendeva dalla memoria di chi chiude. */
if (mode === "close") {
  const esc = P.prefix.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
  const m = String(session).match(new RegExp("^" + esc + "(\\d+)$"));
  if (!m) die(3, [`--session="${session}" non interpretabile per il prefisso "${P.prefix}"`]);
  const n = parseInt(m[1], 10), S = (k) => P.prefix + k, bad = [];
  const c = nextSession(text, { prefix: P.prefix, briefings: br, registryExists: exists, bootstrap: P.bootstrap });
  bad.push(...c.blockers.map(b => `[${b.code}] ${b.message}`));
  if (c.source !== "block") bad.push(`[CLOSE_NO_BLOCK] nel log vivo non c'e' un blocco STATO NUMERAZIONE leggibile (fonte=${c.source}): la chiusura non e' dimostrabile`);
  else {
    if (c.lastOccupied !== S(n)) bad.push(`[CLOSE_OCCUPIED_MISMATCH] ULTIMO NUMERO OCCUPATO = ${c.lastOccupied}, atteso ${S(n)}: blocco non aggiornato in chiusura`);
    if (c.lastClosed !== S(n)) bad.push(`[CLOSE_NOT_MARKED_CLOSED] ULTIMA SESSIONE CHIUSA = ${c.lastClosed}, atteso ${S(n)}`);
    if (c.proposed !== S(n + 1)) bad.push(`[CLOSE_NEXT_MISMATCH] PROSSIMO NUMERO LIBERO = ${c.proposed}, atteso ${S(n + 1)}`);
  }
  const want = `${P.prefix}${n}_OPEN.md`.toLowerCase();
  if (!br.exists || !br.names.some(x => x.toLowerCase() === want)) bad.push(`[CLOSE_BRIEFING_MISSING] ${P.prefix}${n}_OPEN.md assente in ${P.briefings}`);
  if (!exists || !headingNumbers(text, P.prefix).includes(n)) bad.push(`[CLOSE_HEADING_MISSING] nessuna intestazione "## ... ${S(n)}" nel log vivo`);
  /* A1-bis (S214, DA_PROGETTI §2 b). Causa: il Journal ha chiuso S54, S55 e S56 con _status fermo a S53, perche'
   * il passo roll-up (ADR-029) dipendeva dalla memoria di chi chiude. Il file e' accanto all'index (stessa cartella
   * _status/). Read-only: si legge, non si scrive. Passa solo se last_session = S<n> e se date (YYYY-MM-DD) cade tra
   * la data dell'intestazione "## <data> ... S<n>" del log e oggi (cosi' una chiusura dopo mezzanotte non e' bloccata).
   * 'Oggi' = giorno civile in EMPIRE_TZ (Europe/Rome), non l'ora della macchina (L9.13 / D-S214-1, S215). */
  const stp = join(dirname(P.indexPath), `${P.slug}.yaml`);
  /* exit 2, non 3: il 3 e' riservato all'uso errato del comando; un ambiente senza dati di fuso e' uno STOP (rilievo Codex S215) */
  let today; try { today = todayIn(); } catch (e) { die(2, [`oggi non calcolabile in ${EMPIRE_TZ}: ${e.message}`]); }
  if (!existsSync(stp)) bad.push(`[CLOSE_STATUS_MISSING] ${stp} assente: crealo da _TEMPLATE.yaml (ADR-029) con last_session: ${S(n)} e date: ${today}, poi riesegui`);
  else {
    const st = readFileSync(stp, "utf8").replace(/^\uFEFF/, "");   /* PS 5.1 -Encoding UTF8 scrive il BOM */
    /* chiave di primo livello: una sola volta (PyYAML terrebbe l'ultima); valore intero della riga, virgolette bilanciate, poi solo
     * commento separato da spazio (in YAML "S45#x" e' un valore unico). Rilievi Codex giri 4-5 di S215 ("2026-01-02junk", "#junk",
     * "date :", duplicati, 2026-02-31 che PyYAML rifiuta e fa fallire il roll-up). */
    const top1 = (k, val) => { const re = new RegExp("^" + k + "[ \\t]*:(?=[ \\t]|$)(.*)$"), at = [];
      st.split(/\r?\n/).forEach((l, i) => { const m = l.match(re); if (m) at.push({ i, v: m[1] }); });
      if (at.length !== 1) return { n: at.length };
      const m = at[0].v.match(new RegExp("^[ \\t]*([\"']?)(" + val + ")\\1([ \\t]+#.*)?[ \\t]*$"));
      return { n: 1, v: m ? m[2] : undefined, raw: at[0].v.trim() }; };
    const lsR = top1("last_session", "[^\\s\"'#]+"), dtR = top1("date", "\\d{4}-\\d{2}-\\d{2}");
    const ls = lsR.v;
    const dtOk = (d) => { const [y, mo, da] = d.split("-").map(Number), t = new Date(0); t.setUTCFullYear(y, mo - 1, da);   /* setUTCFullYear: niente 00-99 -> 1900 */
      return y >= 1 && t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === da; };   /* anno 0000: Python lo rifiuta (giro 7) */
    const dt = dtR.v && dtOk(dtR.v) ? dtR.v : undefined;
    const tok = new RegExp("(?:^|[^A-Za-z0-9_-])" + esc + n + "(?![0-9])");
    const hd = exists ? text.split(/\r?\n/).filter(l => /^##\s+/.test(l) && tok.test(l.replace(/^##\s+/, " "))).map(l => (l.match(/\d{4}-\d{2}-\d{2}/) || [])[0]).filter(Boolean).sort()[0] : undefined;
    if (lsR.n > 1) bad.push(`[CLOSE_STATUS_STALE] ${stp}: last_session presente ${lsR.n} volte: ne deve restare una sola (${S(n)}), poi riesegui`);
    else if (ls !== S(n)) bad.push(`[CLOSE_STATUS_STALE] ${stp}: last_session = ${ls || (lsR.n ? `non leggibile ("${lsR.raw}")` : "assente")}, atteso ${S(n)}. Aggiorna il file (roll-up ADR-029) e riesegui`);
    if (dtR.n > 1) bad.push(`[CLOSE_STATUS_DATE] ${stp}: date presente ${dtR.n} volte: ne deve restare una sola, poi riesegui`);
    else if (!dt) bad.push(`[CLOSE_STATUS_DATE] ${stp}: date assente, non nel formato YYYY-MM-DD o non un giorno di calendario${dtR.n ? ` ("${dtR.raw}")` : ""}`);
    else {
      if (hd && dt < hd) bad.push(`[CLOSE_STATUS_DATE] ${stp}: date = ${dt}, precedente all'intestazione di ${S(n)} (${hd}): e' la data di una chiusura vecchia`);
      if (dt > today) bad.push(`[CLOSE_STATUS_DATE] ${stp}: date = ${dt}, nel futuro (oggi ${today})`);
    }
    /* L9.17 / A3 (S215). `next` deve esistere e citare la sessione successiva nel designatore nativo (S<n+1>, BA-S<n+1>):
     * in S213-S214 `predator.yaml` e' rimasto con "S213 in corso" a last_session S214 e nessun controllo lo ha visto.
     * Letto: riga singola (senza virgolette, "..." con escape, '...'), commento finale ignorato solo fuori dalle virgolette;
     * blocco YAML `>`/`|` (con indicatori +/-/cifra) = righe indentate fino alla prossima chiave di primo livello. */
    const rn = readNext(st);
    const tokNext = new RegExp("(?:^|[^A-Za-z0-9_-])" + esc + (n + 1) + "(?![0-9A-Za-z_])");   /* S46-bis vale (convenzione -bis dell'Empire); S46a, S46_, S460 no */
    if (rn.kind === "duplicate") bad.push(`[CLOSE_STATUS_NEXT_DUPLICATE] ${stp}: next presente ${rn.lines.length} volte (righe ${rn.lines.join(", ")}): ne deve restare uno solo, poi riesegui`);
    else if (rn.kind === "invalid") bad.push(`[CLOSE_STATUS_NEXT_INVALID] ${stp}: next non leggibile con certezza (${rn.why}): correggi la riga indicata (forma consigliata: next: "${S(n + 1)}: <prossimo passo>" su una riga) e riesegui`);
    else if (rn.kind === "missing" || rn.value === "") bad.push(`[CLOSE_STATUS_NEXT_MISSING] ${stp}: next assente o vuoto: scrivi il prossimo passo citando ${S(n + 1)} (roll-up ADR-029) e riesegui`);
    else if (!tokNext.test(" " + rn.value)) bad.push(`[CLOSE_STATUS_NEXT_STALE] ${stp}: next non cita ${S(n + 1)} ("${rn.value.length > 90 ? rn.value.slice(0, 90) + "..." : rn.value}"): e' il prossimo passo di una sessione vecchia? Aggiornalo (roll-up ADR-029) e riesegui`);
  }
  if (bad.length) die(2, [`CLOSE ${S(n)} NON dimostrata: la sessione NON e' dichiarabile chiusa`, ...bad]);
  console.log(`SESSION GATE: CLOSE PASS ${S(n)} — ${P.slug} (policy ${P.gate}, mode=close READ-ONLY: nessun file creato o modificato)`);
  console.log(JSON.stringify({ ...ident, closed: S(n), next: S(n + 1), source: c.source })); process.exit(0);
}
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
/* OPEN S<n> in check (S209, D13 — S208_D13_DESIGN sez. 4). Informativo, READ-ONLY, exit 0.
 * Solo se l'UNICO briefing oltre l'occupato e' S<next>_OPEN.md e il receipt di apertura di S<next>
 * esiste ed e' coerente: stessa identita', stesso registro, e impronta briefing = quella di PRIMA del
 * briefing (il receipt certifica lo stato pre-booking). Qualunque altro caso resta STOP come prima.
 * Non e' un via libera: la sessione e' GIA aperta, nessuna nuova apertura. */
const OPEN_OK = new Set(["SESSION_ALREADY_BOOKED", "BRIEFINGS_REGISTRY_MISMATCH"]);
if (mode === "check" && r.status !== "OK" && r.proposed && r.lastOccupied && r.codes.every(c => OPEN_OK.has(c)) && br.exists) {
  const esc = P.prefix.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
  const occ = parseInt(String(r.lastOccupied).slice(P.prefix.length), 10);
  const re = new RegExp("^" + esc + "(\\d+)_(OPEN|CLOSE)\\.md$", "i");
  const beyond = br.names.filter(x => { const m = x.match(re); return m && parseInt(m[1], 10) > occ; });
  const rp = join(P.repoPath, "_session", "receipts", `${P.slug}_${r.proposed}.json`);
  if (beyond.length === 1 && beyond[0].toLowerCase() === `${r.proposed}_OPEN.md`.toLowerCase() && existsSync(rp)) {
    let rec = null; try { rec = JSON.parse(readFileSync(rp, "utf8")); } catch { rec = null; }
    const pre = sha(JSON.stringify(br.names.filter(x => x !== beyond[0]).sort()));
    const same = rec && rec.kind === "session-number" && rec.briefingsFingerprint === pre &&
      ["project", "prefix", "session", "policy", "bootstrap", "registryPath", "briefingsPath", "registrySha256"].every(k => rec[k] === ident[k]);
    if (same) {
      console.log(`SESSION GATE: OPEN ${r.proposed} — ${P.slug} (sessione GIA APERTA: ${beyond[0]} + receipt di apertura coerente; informativo, mode=check READ-ONLY, NESSUNA nuova apertura)`);
      console.log(JSON.stringify({ ...ident, status: "open", session: r.proposed, receipt: rp, source: r.source })); process.exit(0);
    }
  }
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
