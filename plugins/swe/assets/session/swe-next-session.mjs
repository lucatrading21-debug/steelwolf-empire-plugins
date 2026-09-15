#!/usr/bin/env node
/* swe-next-session v3 — lettore del prossimo numero di sessione.
 * S204/J0 CANDIDATO. Sola lettura, nessuno stato proprio.
 * v3 dopo 2a review Codex: codici macchina sui blocker; briefing assente != briefing vuoto.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
const OPEN_MARK = /^[^\S\r\n]*<!--[^\S\r\n]*STATO NUMERAZIONE\b/gim;
const F = { occupied:/^\s*ULTIMO NUMERO OCCUPATO\s*:\s*(\S+)(.*)$/im, closed:/^\s*ULTIMA SESSIONE CHIUSA\s*:\s*(\S+)(.*)$/im, next:/^\s*PROSSIMO NUMERO LIBERO\s*:\s*(\S+)(.*)$/im };
const G = { occupied:/^\s*ULTIMO NUMERO OCCUPATO\s*:/gim, closed:/^\s*ULTIMA SESSIONE CHIUSA\s*:/gim, next:/^\s*PROSSIMO NUMERO LIBERO\s*:/gim };
const HOLD = /\b(SOSPES[AO]|ATTIVA|APERTA|NON CHIUSA|OCCUPAT[AO])\b/i;

function num(tok, prefix) {
  const esc = prefix.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
  const m = String(tok).match(new RegExp("^" + esc + "(\\d+)$"));   /* token ESATTO: "S46(SOSPESA)" non e' "S46" */
  return m ? parseInt(m[1], 10) : null;
}
/* Il designatore si cerca OVUNQUE nella riga di intestazione: l'Hub scrive
 * "## 2026-09-05 | Tipo A | V06 Observatory ... S195 CLOSED" e ancorarsi all'inizio del campo
 * rendeva invisibili 17 intestazioni reali su 223 - tra cui S195/S196. Misurato in S204.
 * Le varianti "-bis"/"-exec" appartengono allo stesso numero. */
function headings(text, prefix) {
  const esc = prefix.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
  const re = new RegExp("(?:^|[^A-Za-z0-9_-])" + esc + "(\\d+)(?![0-9])", "g");
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (!/^##\s+/.test(line)) continue;
    const hits = [...line.replace(/^##\s+/, " ").matchAll(re)].map(m => parseInt(m[1], 10));
    if (hits.length) out.push(Math.max(...hits));
  }
  return out;
}
function block(text, prefix, add) {
  const marks = [...text.matchAll(OPEN_MARK)];
  const stray = Object.fromEntries(Object.entries(G).map(([k, re]) => [k, [...text.matchAll(re)].length]));
  if (!marks.length) {
    if (stray.occupied || stray.closed || stray.next) add("BLOCK_UNDELIMITED", "campi STATO NUMERAZIONE senza marcatore di apertura `<!-- STATO NUMERAZIONE`");
    return null;
  }
  if (marks.length > 1) { add("BLOCK_DUPLICATED", `${marks.length} marcatori STATO NUMERAZIONE nel documento`); return null; }
  const lines = text.slice(marks[0].index).split(/\r?\n/), buf = [];
  for (let i = 1; i < lines.length; i++) { if (!lines[i].trim() || /^##\s/.test(lines[i])) break; buf.push(lines[i]); }
  const scope = buf.join("\n"), got = {};
  for (const [k, re] of Object.entries(F)) { const m = scope.match(re); if (m) got[k] = { tok: m[1], rest: m[2] || "" }; }
  const missing = Object.keys(F).filter(k => !got[k]);
  if (missing.length) { add("BLOCK_INCOMPLETE", `campi mancanti dentro il blocco: ${missing.join(", ")}`); return null; }
  for (const k of Object.keys(G)) if (stray[k] > 1) add("BLOCK_FIELD_DUPLICATED", `campo "${k}" presente ${stray[k]} volte: valori da blocchi diversi non combinabili`);
  const v = {};
  for (const k of Object.keys(F)) { v[k] = num(got[k].tok, prefix); if (v[k] === null) add("VALUE_UNPARSABLE", `${k} = "${got[k].tok}" non interpretabile per prefisso "${prefix}"`); }
  /* Il marcatore di ritegno si cerca nell'INTERO blocco, marcatore di apertura compreso:
   * scriverlo su una riga propria o nel commento di testa non deve poterlo aggirare (S204).
   * Per la stessa ragione il blocco NON ammette prosa libera: vedi skill `end` §1-bis. */
  const headLine = text.slice(marks[0].index).split(/\r?\n/)[0];
  /* Le ETICHETTE dei campi si rimuovono prima di cercare: "ULTIMO NUMERO OCCUPATO" contiene
   * "OCCUPATO" e matcherebbe se stessa (difetto introdotto e misurato in S204). */
  const stripLabels = (x) => x.replace(/^\s*(ULTIMO NUMERO OCCUPATO|ULTIMA SESSIONE CHIUSA|PROSSIMO NUMERO LIBERO)\s*:/gim, " ");
  const whole = stripLabels(headLine) + "\n" + stripLabels(scope);
  const h = whole.match(HOLD);
  let src = null;
  if (h) { for (const [k, lbl] of [["next","PROSSIMO NUMERO LIBERO"],["occupied","ULTIMO NUMERO OCCUPATO"],["closed","ULTIMA SESSIONE CHIUSA"]])
    if (HOLD.test(got[k].rest)) { src = lbl; break; }
    if (!src) src = HOLD.test(headLine) ? "riga del marcatore" : "riga propria dentro il blocco"; }
  return { ...v, hold: !!h, holdText: h ? h[0] : null, holdSrc: src };
}

/** opt: {prefix, requested, briefings:{provided,exists,names}, registryExists:boolean, bootstrap:"on-demand"|null} */
export function nextSession(text, opt = {}) {
  const prefix = opt.prefix || "S";
  const requested = opt.requested ?? null;
  const br = opt.briefings || { provided: false, exists: false, names: [] };
  const registryExists = opt.registryExists !== false;
  const bootstrap = opt.bootstrap || null;
  const B = [];
  const add = (code, message) => B.push({ code, message });
  const heads = registryExists ? headings(text, prefix) : [];
  const maxHead = heads.length ? Math.max(...heads) : null;
  const blk = registryExists ? block(text, prefix, add) : null;
  let candidate = null, lastOccupied = null, lastClosed = null, source = "none";

  /* BOOTSTRAP (§0-ter.4-bis/4-ter): registro non ancora esistente su progetto on-demand -> S1.
   * Non e' un fallback: e' uno stato legittimo e dichiarato. Fuori da questo caso, registro
   * assente e' un blocco. */
  if (!registryExists) {
    if (bootstrap === "on-demand") {
      source = "bootstrap"; candidate = 1; lastOccupied = null; lastClosed = null;
    } else {
      add("NO_REGISTRY", `registro assente e progetto non dichiarato bootstrap:on-demand (bootstrap=${bootstrap === null ? "none" : bootstrap})`);
    }
  } else if (blk && !B.length) {
    source = "block"; lastOccupied = blk.occupied; lastClosed = blk.closed; candidate = blk.next;
    if (blk.closed > blk.occupied) add("CONTRADICTION_CLOSED_GT_OCCUPIED", `ULTIMA SESSIONE CHIUSA (${prefix}${blk.closed}) > ULTIMO NUMERO OCCUPATO (${prefix}${blk.occupied})`);
    if (blk.next <= blk.occupied) add("NEXT_ALREADY_OCCUPIED", `${prefix}${blk.next} <= ultimo occupato ${prefix}${blk.occupied}`);
    if (blk.next !== blk.occupied + 1) add("NUMBERING_GAP", `PROSSIMO ${prefix}${blk.next} != OCCUPATO+1 ${prefix}${blk.occupied + 1}`);
    if (maxHead !== null && maxHead > blk.occupied) add("REGISTRY_HEADING_BEYOND_OCCUPIED", `intestazione ${prefix}${maxHead} oltre l'occupato dichiarato ${prefix}${blk.occupied}`);
    if (blk.hold) add("HOLD_MARKER", `blocco marcato "${blk.holdText}" (origine: ${blk.holdSrc}): ${prefix}${blk.next} non apribile senza decisione owner esplicita`);
  } else if (!blk) {
    source = "headings";
    if (maxHead === null) add("NO_DATA", "nessun blocco e nessuna intestazione di sessione riconosciuta");
    else { candidate = maxHead + 1; lastOccupied = maxHead;
      add("NO_AUTHORITATIVE_SOURCE", `senza blocco non e' provato se ${prefix}${maxHead} sia CHIUSA o ancora ATTIVA`); }
  }

  if (!br.provided) add("BRIEFINGS_NOT_PROVIDED", "cartella briefing non indicata: impossibile escludere una sessione gia aperta");
  else if (!br.exists) {
    /* In bootstrap la cartella puo' legittimamente non esistere (§0-ter.4-ter): e' il caso che la
     * clausola prevede. Fuori dal bootstrap, assente != vuota -> blocco. */
    if (source !== "bootstrap") add("BRIEFINGS_MISSING", "cartella briefing indicata ma ASSENTE sul filesystem: assenza != vuota, lo stato delle prenotazioni e' ignoto");
  } else {
    const esc = prefix.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
    const re = new RegExp("^" + esc + "(\\d+)_(OPEN|CLOSE)\\.md$", "i");
    const booked = [];
    for (const n of br.names) { const m = n.match(re); if (m) booked.push({ n: parseInt(m[1], 10), name: n }); }
    if (candidate !== null) { const c = booked.find(b => b.n === candidate); if (c) add("SESSION_ALREADY_BOOKED", `${prefix}${candidate} gia prenotata/aperta: esiste ${c.name}`); }
    const maxBook = booked.length ? Math.max(...booked.map(b => b.n)) : null;
    if (maxBook !== null && lastOccupied !== null && maxBook > lastOccupied)
      add("BRIEFINGS_REGISTRY_MISMATCH", `briefing ${prefix}${maxBook} presente ma registro occupato fino a ${prefix}${lastOccupied}`);
  }

  if (requested !== null) {
    const rq = num(requested, prefix);
    if (rq === null) add("REQUESTED_UNPARSABLE", `numero richiesto "${requested}" non interpretabile`);
    else {
      if (lastOccupied !== null && rq <= lastOccupied) add("REQUESTED_OCCUPIED", `RIFIUTO ${prefix}${rq}: gia occupato (ultimo ${prefix}${lastOccupied})`);
      if (candidate !== null && rq !== candidate) add("REQUESTED_MISMATCH", `richiesto ${prefix}${rq} != candidato ${prefix}${candidate}`);
    }
  }
  const f = (n) => (n === null ? null : prefix + n);
  return { status: B.length ? "STOP" : "OK", next: B.length ? null : f(candidate), proposed: f(candidate),
           lastOccupied: f(lastOccupied), lastClosed: f(lastClosed), source,
           codes: B.map(b => b.code), blockers: B };
}
