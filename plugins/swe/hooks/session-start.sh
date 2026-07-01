#!/usr/bin/env bash
# SteelWolf Empire - SessionStart hook
# Copyright (c) 2026 Luke SteelWolf - All Rights Reserved
#
# Triggered: Claude Code/Cowork session start (new or resumed).
# Stdout is injected into context (Anthropic 2026 spec). SessionStart runs
# BEFORE MCP servers connect: static text only, no MCP/network, zero-secret.
# Pure ASCII, no shell metacharacters (safe under cmd and bash).

# --- SWE-PROBE (temporaneo S159, rimuovere allo Step 2 guard) - NO stdin (non bloccante) ---
echo "=== SWE-PROBE ==="
echo "PWD=$(pwd 2>/dev/null)"
echo "CLAUDE_PROJECT_DIR=${CLAUDE_PROJECT_DIR:-unset}"
echo "=== /SWE-PROBE ==="

cat <<'HOOK_OUTPUT'
=== STEELWOLF EMPIRE - SESSION OPEN ===
Esegui l apertura standard SteelWolf. Non modificare alcun file prima del GO.

STEP 0 - PC + PULL:
- Dichiara il PC attivo (PREDATOR / ACE). Se non lo rilevi, chiedilo a Luke.
- Fai o chiedi git pull sui repo attivi (pull-first, LL-Empire-023).

STEP 1 - DOC L0 (ordine SteelWolf):
- CLAUDE.md hierarchy -> SESSION_LOG ultime ~20 righe -> LESSONS_LEARNED
  -> ROADMAP / EMPIRE_DASHBOARD.

STEP 2 - APERTURA INTERATTIVA:
- Conferma stato: PC . esito pull (fatto / da fare) . priorita sessione.
- Colpo d occhio: sintesi CHECKLIST + ROADMAP (o EMPIRE_DASHBOARD) del progetto attivo.
- In Cowork: widget di conferma a runtime. In Claude Code CLI: stesso contenuto in testo.

STEP 3 - ATTENDI GO:
- ATTENDI il GO esplicito di Luke prima di modificare qualsiasi file (LL-Empire-002).
- Verifica empirica sandbox vs CMD Windows (LL-Empire-024).

Prossimo step consigliato: /swe:start <progetto-opzionale>
=== END SESSION OPEN ===
HOOK_OUTPUT

exit 0
