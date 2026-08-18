#!/usr/bin/env node
/* SteelWolf Empire - closing/handoff card guard (UserPromptExpansion, Node exec form).
 * Scatta su /swe:end|/swe:cycle (matcher in hooks.json = command name). NON legge stdin
 * (Cowork-safe, LL-060/S159): il runtime filtra il comando col matcher -> qui inietto SOLO l'ordine.
 * stdout di UserPromptExpansion e' iniettato nel contesto (docs.claude.com/en/docs/claude-code/hooks).
 * Gemello del SessionStart per l'apertura: rende la card di CHIUSURA/HANDOFF deterministica (S168 Passo 7).
 * Fail-open: qualsiasi errore -> exit 0, mai bloccare. Copyright (c) 2026 Luke SteelWolf. */
"use strict";
try {
  if (!require("./_swe-domain.js")()) process.exit(0);
  console.log(`=== SteelWolf Empire — CHIUSURA/CICLO: CARD OBBLIGATORIA (Passo 7) ===
Stai per eseguire /swe:end oppure /swe:cycle.

STEP 0 — NON SALTABILE (prima di scrivere QUALSIASI testo o file di chiusura):
  1. Costruisci il modello JSON di chiusura con lo SCOPE dentro:
     "scope": {"kind":"closing","project":"<slug>","session":"S<n>"}   (se cycle, anche "handoff").
  2. Rendi la card CON I FLAG DI SCOPE (obbligatori da CARD-05, senza escono errore 3):
     node \${CLAUDE_PLUGIN_ROOT}/skills/start/assets/render-card.mjs <model.json> \\
          --scope-kind=closing --scope-project=<slug> --scope-session=S<n> > <card.html>
  3. Mostra l'HTML risultante con show_widget.
  4. GATE CARD-04, fail-closed — esegui e incolla l'esito:
     node \${CLAUDE_PLUGIN_ROOT}/skills/end/assets/verify-close-card.mjs \\
          --project=<slug> --session=S<n> --kind=closing --model=<model.json> --card=<card.html>
     exit != 0  ->  STOP: nessuna scrittura di chiusura. Correggi il MODELLO e rirendi, mai l'HTML.

La Enriched Visual View di chiusura/handoff DEVE essere il PRIMO output visibile in Cowork.
Se non l'hai ancora mostrata via show_widget, NON procedere al recap testuale ne' alla scrittura dei file
(CARD FREEZE S166 · Passo 6/7). Su Code CLI/Chat puri (no show_widget): fallback testo strutturato.`);
  process.exit(0);
} catch (e) { process.exit(0); }
