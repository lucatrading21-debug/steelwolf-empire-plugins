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
  1. Costruisci il modello JSON di chiusura ("kind":"closing"); se cycle, anche handoff ("kind":"handoff").
  2. Esegui il renderer:  node \${CLAUDE_PLUGIN_ROOT}/skills/start/assets/render-card.mjs <model.json>
  3. Mostra l'HTML risultante con show_widget.

La Enriched Visual View di chiusura/handoff DEVE essere il PRIMO output visibile in Cowork.
Se non l'hai ancora mostrata via show_widget, NON procedere al recap testuale ne' alla scrittura dei file
(CARD FREEZE S166 · Passo 6/7). Su Code CLI/Chat puri (no show_widget): fallback testo strutturato.`);
  process.exit(0);
} catch (e) { process.exit(0); }
