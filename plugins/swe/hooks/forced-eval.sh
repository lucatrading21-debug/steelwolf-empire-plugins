#!/usr/bin/env bash
# SteelWolf Empire — Forced-eval UserPromptSubmit hook
# Copyright © 2026 Luke SteelWolf — All Rights Reserved
#
# Triggered: every user prompt before Claude processes it.
# Output (stdout) is INJECTED as context Claude must consider (Anthropic 2026 spec).
# Purpose: forced skill activation evaluation — community pattern 84% Haiku, 100% Sonnet 4.5.
#
# Pattern reference: scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals
# 3-step commitment mechanism: EVALUATE → ACTIVATE → IMPLEMENT.

set -euo pipefail

cat <<EVAL_DIRECTIVE
=== SteelWolf Empire — Skill Activation Forced Evaluation ===

OBBLIGATORIO prima di rispondere al prompt utente:

STEP 1 — EVALUATE (per ogni skill plugin swe disponibile):
  - swe:start (apertura sessione Empire) — YES/NO + reason
  - swe:end (chiusura D6) — YES/NO + reason
  - swe:compact (compact mid-session) — YES/NO + reason

STEP 2 — ACTIVATE:
  Se almeno una skill = YES → invoca skill PRIMA di proseguire (model invocation).
  Pattern: Claude usa direttamente il body del SKILL.md come instruction set.

STEP 3 — IMPLEMENT:
  Solo dopo Step 1+2 completi → procedi con implementazione richiesta utente.

REGOLE BINDING (LL-Empire):
- LL-Empire-002 PROTOCOLLO GO: mai eseguire azione filesystem destructive senza GO esplicito Luke
- LL-Empire-008 VERIFICA EMPIRICA: tool check su stato attuale prima di assumere
- LL-Empire-023 PULL-FIRST: git pull se sessione apertura

Se nessuna skill matcha → procedi normale ma menziona "no swe skill triggered" nel ragionamento.
EVAL_DIRECTIVE

exit 0
