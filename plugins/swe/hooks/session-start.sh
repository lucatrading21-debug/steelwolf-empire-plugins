#!/usr/bin/env bash
# SteelWolf Empire — SessionStart hook
# Copyright © 2026 Luke SteelWolf — All Rights Reserved
#
# Triggered: Claude Code/Cowork session start (new or resumed).
# Output (stdout) is added as context Claude can see and act on (Anthropic 2026 spec).
# Purpose: surface critical Empire state at session open without burning user tokens.

set -euo pipefail

DATE=$(date +"%Y-%m-%d %H:%M:%S %Z")
PC_NAME="${COMPUTERNAME:-${HOSTNAME:-unknown}}"

cat <<HOOK_OUTPUT
=== SteelWolf Empire — SessionStart Hook ===
Timestamp: ${DATE}
PC: ${PC_NAME}

REMINDER OBBLIGATORI (LL-Empire binding):
- LL-Empire-023 PULL-FIRST: esegui git pull origin <branch> su 11 repo PRIMA di qualsiasi azione
- LL-Empire-002 PROTOCOLLO GO: zero esecuzione prima di GO esplicito Luke
- LL-Empire-024 SANDBOX STALE: CMD Windows è autoritativo per stato working tree, sandbox bash NON
- LL-Empire-008 VERIFICA EMPIRICA: mai assumere stato, sempre tool check

PROSSIMO STEP CONSIGLIATO:
- /swe:start <progetto-opzionale>  (apertura sessione completa)

HOOK_OUTPUT

# Conditional: append last SESSION_LOG entry if file accessible
if [ -f "${HOME}/SteelWolf_Empire/hub/steelwolf-empire-hub/SESSION_LOG.md" ]; then
  echo "=== Ultima entry SESSION_LOG (preview) ==="
  tail -20 "${HOME}/SteelWolf_Empire/hub/steelwolf-empire-hub/SESSION_LOG.md" | head -10
fi

exit 0
