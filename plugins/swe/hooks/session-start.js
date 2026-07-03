#!/usr/bin/env node
/* SteelWolf Empire - SessionStart hook (Node exec form, Windows-safe).
 * S166 Passo 2: l'HOOK PRE-RENDERIZZA la opening card e INIETTA "mostra il file".
 * L'istanza NON disegna piu': legge l'HTML gia' pronto e fa show_widget.
 * Pattern (ricerca UI-da-LLM): ragionamento (modello JSON persistito) separato dal
 * rendering (renderer deterministico eseguito dall'hook). Fail-open: se qualcosa manca,
 * degrada al flusso "istanza costruisce" senza mai bloccare l'apertura.
 * SSOT modello: blocco fenced ```swe-model {json} ``` dentro SESSION_BRIEFINGS/S<n>_OPEN.md.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
if (!require("./_swe-domain.js")()) process.exit(0);

const path = require("path");
const fs = require("fs");
const cp = require("child_process");

function roots() {
  const env = process.env;
  const list = [];
  const push = v => { if (v) String(v).split(/[;,]/).forEach(s => { s = s.trim(); if (s) list.push(s); }); };
  push(env.CLAUDE_CODE_WORKSPACE_HOST_PATHS);
  push(env.CLAUDE_PROJECT_DIR);
  try { list.push(process.cwd()); } catch (e) {}
  return Array.from(new Set(list));
}
function findBriefings(rs) {
  for (const r of rs) {
    const cands = [
      path.join(r, "hub", "steelwolf-empire-hub", "SESSION_BRIEFINGS"),
      path.join(r, "steelwolf-empire-hub", "SESSION_BRIEFINGS"),
      path.join(r, "SESSION_BRIEFINGS")
    ];
    for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (e) {} }
  }
  return null;
}
function latestOpen(dir) {
  try {
    const fsx = fs.readdirSync(dir).filter(f => /^S\d+_OPEN\.md$/.test(f));
    if (!fsx.length) return null;
    fsx.sort((a, b) => (parseInt(a.slice(1)) || 0) - (parseInt(b.slice(1)) || 0));
    return path.join(dir, fsx[fsx.length - 1]);
  } catch (e) { return null; }
}
function extractModel(file) {
  try {
    const txt = fs.readFileSync(file, "utf8");
    const m = txt.match(/```swe-model\s*([\s\S]*?)```/);
    if (!m) return null;
    JSON.parse(m[1]); /* valida */
    return m[1];
  } catch (e) { return null; }
}
function renderHtml(modelJson) {
  const R = path.join(__dirname, "..", "skills", "start", "assets", "render-card.mjs");
  if (!fs.existsSync(R)) return null;
  try {
    const out = cp.execFileSync(process.execPath, [R], { input: modelJson, encoding: "utf8", timeout: 10000, maxBuffer: 8 * 1024 * 1024 });
    return (out && out.indexOf("{{") === -1 && out.length > 200) ? out : null;
  } catch (e) { return null; }
}
function writeCard(html) {
  try {
    const p = path.join(process.cwd(), ".swe-open-card.html");
    fs.writeFileSync(p, html, "utf8");
    return p;
  } catch (e) { return null; }
}

/* ---- pipeline (tutta fail-open) ---- */
let modelFile = "none", modelOk = false, cardPath = null;
try {
  const bd = findBriefings(roots());
  if (bd) {
    const mo = latestOpen(bd);
    if (mo) {
      modelFile = mo;
      const mj = extractModel(mo);
      if (mj) {
        modelOk = true;
        const html = renderHtml(mj);
        if (html) cardPath = writeCard(html);
      }
    }
  }
} catch (e) {}

const PROBE = "=== SWE RUNTIME STATUS S166 ===\n" +
  "model_file: " + modelFile + "\n" +
  "model_ok: " + modelOk + "\n" +
  "card_ready: " + (cardPath ? cardPath : "no (degrada a costruzione istanza)") + "\n" +
  "=== END STATUS ===";

let STEP2;
if (cardPath) {
  STEP2 = `STEP 2 - CARD GIA PRONTA (NON disegnare):
- L hook ha GIA generato la opening card in: ${cardPath}
- Nel tuo mount Cowork e' il file .swe-open-card.html dentro la cartella outputs.
- Leggi quel file e passa il suo contenuto ESATTO a show_widget. NON costruire, NON improvvisare, NON usare AskUserQuestion/elicitation.
- Conferma stato in testo (PC . pull . priorita) SOTTO la card. In CLI: descrivi la card a parole.`;
} else {
  STEP2 = `STEP 2 - APERTURA INTERATTIVA (fallback: card non pre-generata):
- Costruisci il modello JSON (shape render-card.README) ed esegui skills/start/assets/render-card.mjs -> HTML -> show_widget. NON disegnare a mano.
- VIETATO AskUserQuestion / elicitation / card improvvisate. CLI/Chat: stesso contenuto in testo.
- Conferma stato: PC . esito pull . priorita. Colpo d occhio: CHECKLIST + ROADMAP del progetto attivo.`;
}

console.log(`${PROBE}

=== STEELWOLF EMPIRE - SESSION OPEN ===
LINGUA: rispondi e ragiona SEMPRE in italiano (risposte, preamboli, thinking). Mai inglese.
Esegui l apertura standard SteelWolf. Non modificare alcun file prima del GO.

STEP 0 - PC + PULL:
- Dichiara il PC attivo (PREDATOR / ACE). Se non lo rilevi, chiedilo a Luke.
- Fai o chiedi git pull sui repo attivi (pull-first, LL-Empire-023).

STEP 1 - DOC L0 (ordine SteelWolf):
- CLAUDE.md hierarchy -> SESSION_LOG ultime ~20 righe -> LESSONS_LEARNED
  -> ROADMAP / EMPIRE_DASHBOARD.

${STEP2}

STEP 3 - ATTENDI GO:
- ATTENDI il GO esplicito di Luke prima di modificare qualsiasi file (LL-Empire-002).
- Verifica empirica sandbox vs CMD Windows (LL-Empire-024).

Prossimo step consigliato: /swe:start <progetto-opzionale>
=== END SESSION OPEN ===`);
process.exit(0);
