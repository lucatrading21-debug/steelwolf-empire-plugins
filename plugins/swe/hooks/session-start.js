#!/usr/bin/env node
/* SteelWolf Empire - SessionStart hook (Node exec form, Windows-safe).
 * Stdout iniettato in contesto (spec Anthropic 2026). Guard di dominio.
 * S166: RUNTIME PROBE fail-open (Passo 1) - stampa fatti runtime per decidere
 * il wiring definitivo del renderer. NON blocca mai l'apertura.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
if (!require("./_swe-domain.js")()) process.exit(0);

/* ---- RUNTIME PROBE (S166, fail-open, ASCII) ---- */
function probe() {
  const path = require("path");
  const fs = require("fs");
  const L = [];
  const env = process.env;
  const cowork = env.CLAUDE_CODE_IS_COWORK === "1";
  const hostRaw = env.CLAUDE_CODE_WORKSPACE_HOST_PATHS || "";
  L.push("cowork: " + (cowork ? "1" : "0"));
  L.push("host_paths: " + (hostRaw || "(vuoto)"));
  L.push("project_dir: " + (env.CLAUDE_PROJECT_DIR || "(vuoto)"));
  L.push("plugin_root: " + (env.CLAUDE_PLUGIN_ROOT || "(vuoto)"));
  try { L.push("cwd: " + process.cwd()); } catch (e) { L.push("cwd: ERR " + e.message); }
  L.push("hook_dir: " + __dirname);
  const rp = path.join(__dirname, "..", "skills", "start", "assets", "render-card.mjs");
  const tp = path.join(__dirname, "..", "skills", "start", "assets", "opening-card.template.html");
  try { L.push("renderer: " + rp + " exists=" + fs.existsSync(rp)); } catch (e) { L.push("renderer: ERR " + e.message); }
  try { L.push("template: " + tp + " exists=" + fs.existsSync(tp)); } catch (e) { L.push("template: ERR " + e.message); }
  /* model scan: cerca hub/steelwolf-empire-hub/SESSION_BRIEFINGS sotto ogni host path */
  try {
    const roots = hostRaw.split(/[;,]/).map(function (s) { return s.trim(); }).filter(Boolean);
    let found = "none";
    for (const r of roots) {
      const cands = [
        path.join(r, "hub", "steelwolf-empire-hub", "SESSION_BRIEFINGS"),
        path.join(r, "steelwolf-empire-hub", "SESSION_BRIEFINGS"),
        path.join(r, "SESSION_BRIEFINGS")
      ];
      for (const c of cands) {
        try {
          if (fs.existsSync(c)) {
            const opens = fs.readdirSync(c).filter(function (f) { return /_OPEN\.md$/.test(f); }).sort();
            found = c + " | open_files=" + (opens.length ? opens.slice(-3).join(",") : "0");
            break;
          }
        } catch (e) { /* ignora candidato */ }
      }
      if (found !== "none") break;
    }
    L.push("model_scan: " + found);
  } catch (e) { L.push("model_scan: ERR " + e.message); }
  return "=== SWE RUNTIME PROBE S166 (fail-open) ===\n" + L.join("\n") + "\n=== END PROBE ===";
}
let PROBE = "";
try { PROBE = probe(); } catch (e) { PROBE = "=== SWE RUNTIME PROBE S166 ===\nprobe_error: " + e.message + "\n=== END PROBE ==="; }

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

STEP 2 - APERTURA INTERATTIVA (Enriched Visual View):
- Rendi SEMPRE l asset skills/start/assets/opening-card.template.html via show_widget (SKILL start sez 5-bis.2), coi valori dedotti pre-accesi.
- VIETATO AskUserQuestion / widget elicitation / card improvvisate. CLI/Chat: stesso contenuto in testo.
- Conferma stato: PC . esito pull . priorita sessione.
- Colpo d occhio: sintesi CHECKLIST + ROADMAP (o EMPIRE_DASHBOARD) del progetto attivo.
- In Cowork: widget di conferma a runtime. In Claude Code CLI: stesso contenuto in testo.
- NB S166 (probe attivo): riporta a Luke il blocco RUNTIME PROBE qui sopra (serve per il wiring renderer).

STEP 3 - ATTENDI GO:
- ATTENDI il GO esplicito di Luke prima di modificare qualsiasi file (LL-Empire-002).
- Verifica empirica sandbox vs CMD Windows (LL-Empire-024).

Prossimo step consigliato: /swe:start <progetto-opzionale>
=== END SESSION OPEN ===`);
process.exit(0);
