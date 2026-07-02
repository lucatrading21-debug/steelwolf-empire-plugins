#!/usr/bin/env node
/* SteelWolf Empire - SessionStart hook (Node exec form, Windows-safe).
 * Stdout iniettato in contesto (spec Anthropic 2026). Guard di dominio.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
if (!require("./_swe-domain.js")()) process.exit(0);
console.log(`=== STEELWOLF EMPIRE - SESSION OPEN ===
LINGUA: rispondi e ragiona SEMPRE in italiano (risposte, preamboli, thinking). Mai inglese.
Esegui l apertura standard SteelWolf. Non modificare alcun file prima del GO.

STEP 0 - PC + PULL:
- Dichiara il PC attivo (PREDATOR / ACE). Se non lo rilevi, chiedilo a Luke.
- Fai o chiedi git pull sui repo attivi (pull-first, LL-Empire-023).

STEP 1 - DOC L0 (ordine SteelWolf):
- CLAUDE.md hierarchy -> SESSION_LOG ultime ~20 righe -> LESSONS_LEARNED
  -> ROADMAP / EMPIRE_DASHBOARD.

STEP 2 - APERTURA INTERATTIVA (Enriched Visual View):
- Rendi SEMPRE l asset skills/start/assets/opening-card.template.html via show_widget (SKILL start §5-bis.2), coi valori dedotti pre-accesi.
- VIETATO AskUserQuestion / widget elicitation / card improvvisate. CLI/Chat: stesso contenuto in testo.
- Conferma stato: PC . esito pull . priorita sessione.
- Colpo d occhio: sintesi CHECKLIST + ROADMAP (o EMPIRE_DASHBOARD) del progetto attivo.
- In Cowork: widget di conferma a runtime. In Claude Code CLI: stesso contenuto in testo.

STEP 3 - ATTENDI GO:
- ATTENDI il GO esplicito di Luke prima di modificare qualsiasi file (LL-Empire-002).
- Verifica empirica sandbox vs CMD Windows (LL-Empire-024).

Prossimo step consigliato: /swe:start <progetto-opzionale>
=== END SESSION OPEN ===`);
process.exit(0);
