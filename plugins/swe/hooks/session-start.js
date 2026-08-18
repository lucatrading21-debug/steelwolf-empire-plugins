#!/usr/bin/env node
/* SteelWolf Empire - SessionStart hook (Node exec form, Windows-safe).
 * S166 Passo 2: l'HOOK PRE-RENDERIZZA la opening card e INIETTA "mostra il file".
 * S189 CARD-08: il briefing e' vincolato al PROGETTO della scrivania. Nessun fallback all'Hub,
 * nessun "piu' recente" globale. Se il progetto non e' stabilibile, o il briefing non gli
 * appartiene, o e' ambiguo -> NESSUNA CARD, con motivo esplicito nel probe.
 *
 * Prima di S189 `findBriefings()` provava per PRIMO `hub/steelwolf-empire-hub/SESSION_BRIEFINGS`
 * su ogni root. Poiche' ADR-027 impone che ogni scrivania-progetto monti `hub/` come livello L3,
 * il risultato MISURATO era: scrivania Lab -> briefing dell'Hub, model_ok true, card generata.
 * Una card perfetta dal progetto sbagliato: il falso verde che CARD-08 esiste per impedire.
 *
 * Fail-closed sull'IDENTITA'; cio' che degrada e' solo il livello di rendering (L1 -> L2).
 * SSOT modello: blocco fenced ```swe-model {json} ``` dentro <briefings del progetto>/S<n>_OPEN.md.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
if (!require("./_swe-domain.js")()) process.exit(0);

const path = require("path");
const fs = require("fs");
const cp = require("child_process");
const P = require("./_swe-project.js");

function searchDirs() {
  const env = process.env, list = [];
  const push = v => { if (v) String(v).split(/[;,]/).forEach(s => { s = s.trim(); if (s) list.push(s); }); };
  push(env.CLAUDE_CODE_WORKSPACE_HOST_PATHS);
  push(env.CLAUDE_PROJECT_DIR);
  try { list.push(process.cwd()); } catch (_) {}
  return Array.from(new Set(list));
}
function extractModel(file) {
  try {
    const txt = fs.readFileSync(file, "utf8");
    const m = txt.match(/```swe-model\s*([\s\S]*?)```/);
    if (!m) return { error: "il briefing non contiene il blocco ```swe-model```" };
    let obj; try { obj = JSON.parse(m[1]); } catch (e) { return { error: "swe-model non e' JSON valido: " + e.message }; }
    return { json: m[1], obj: obj };
  } catch (e) { return { error: "briefing illeggibile: " + e.message }; }
}
function renderHtml(modelJson) {
  const R = path.join(__dirname, "..", "skills", "start", "assets", "render-card.mjs");
  if (!fs.existsSync(R)) return null;
  try {
    const out = cp.execFileSync(process.execPath, [R], { input: modelJson, encoding: "utf8", timeout: 10000, maxBuffer: 8 * 1024 * 1024 });
    return (out && out.indexOf("{{") === -1 && out.length > 200) ? out : null;
  } catch (_) { return null; }
}
function writeCard(html) {
  try { const p = path.join(process.cwd(), ".swe-open-card.html"); fs.writeFileSync(p, html, "utf8"); return p; }
  catch (_) { return null; }
}

/* ---- pipeline: identita' fail-closed, rendering degradabile ---- */
let project = "NON RISOLTO", modelFile = "none", modelOk = false, cardPath = null, stop = null, binding = "n/d", signal = "n/d";
try {
  const dirs = searchDirs();
  let empireRoot = null;
  for (const d of dirs) { empireRoot = P.findEmpireRoot(d); if (empireRoot) break; }
  if (!empireRoot) {
    stop = "non trovo `_PROJECTS_INDEX.yaml` risalendo da: " + dirs.join(" | ");
  } else {
    const projects = P.loadProjects(empireRoot);
    const desk = P.resolveDesk({ projects: projects, cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(), hostPaths: process.env.CLAUDE_CODE_WORKSPACE_HOST_PATHS });
    if (desk.error) { stop = desk.error; }
    else {
      project = desk.slug;
      signal = desk.signal + (desk.others && desk.others.length ? "  (altri mount: " + desk.others.join(", ") + " - attesi per ADR-027 L2/L3)" : "");
      const proj = projects.find(x => x.slug === desk.slug);
      if (!proj) { stop = "progetto `" + desk.slug + "` assente dall'index"; }
      else if (proj.swe_writes === false) { stop = "`" + desk.slug + "` e' un dominio ESTERNO: swe non apre sessioni qui"; }
      else {
        const br = P.resolveBriefing(proj, empireRoot);
        if (br.error) { stop = br.error; }
        else {
          modelFile = br.file;
          binding = "dir=" + proj.briefings + " + pattern=" + br.pattern;
          const mm = extractModel(br.file);
          if (mm.error) { stop = mm.error; }
          else {
            const declared = mm.obj && (mm.obj.project || (mm.obj.scalars && mm.obj.scalars.PROJECT_SLUG));
            if (declared && String(declared).toLowerCase() !== desk.slug) {
              stop = "il briefing dichiara il progetto `" + declared + "` ma la scrivania e' `" + desk.slug + "`";
            } else {
              modelOk = true;
              binding += declared ? " + model.project=" + declared : " (model.project assente: binding implicito da path+prefisso)";
              const html = renderHtml(mm.json);
              if (html) cardPath = writeCard(html);
            }
          }
        }
      }
    }
  }
} catch (e) { stop = "errore nel resolver: " + (e && e.message ? e.message : e); }

const PROBE = "=== SWE RUNTIME STATUS S189 (CARD-08) ===\n" +
  "project: " + project + "\n" +
  "desk_signal: " + signal + "\n" +
  "briefing_binding: " + binding + "\n" +
  "model_file: " + modelFile + "\n" +
  "model_ok: " + modelOk + "\n" +
  "card_ready: " + (cardPath ? cardPath : "no") + "\n" +
  (stop ? "stop_reason: " + stop + "\n" : "") +
  "=== END STATUS ===";

let STEP2;
if (cardPath) {
  STEP2 = `STEP 2 - CARD GIA PRONTA (NON disegnare):
- L hook ha GIA generato la opening card in: ${cardPath}
- Nel tuo mount Cowork e' il file .swe-open-card.html dentro la cartella outputs.
- Leggi quel file e passa il suo contenuto ESATTO a show_widget. NON costruire, NON improvvisare, NON usare AskUserQuestion/elicitation.
- Conferma stato in testo (PC . pull . priorita) SOTTO la card. In CLI: descrivi la card a parole.`;
} else if (project !== "NON RISOLTO" && !stop) {
  STEP2 = `STEP 2 - APERTURA INTERATTIVA (renderer istanza, livello L2 dichiarato):
- Il progetto e' risolto: ${project}. Costruisci il modello JSON (shape render-card.README) SOLO con
  briefing/checklist/roadmap DI QUESTO progetto, poi esegui skills/start/assets/render-card.mjs -> HTML -> show_widget.
- VIETATO AskUserQuestion / elicitation / card disegnate a mano. Dichiara il livello (L2).`;
} else {
  STEP2 = `STEP 2 - STOP: identita' o briefing NON risolti (CARD-08, fail-closed).
- Motivo: ${stop || "progetto non risolto"}
- NON aprire la card. NON usare il briefing di un altro progetto. NON ripiegare sull'Hub.
- NON assumere un default: riporta il motivo a Luke e attendi istruzioni.`;
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
