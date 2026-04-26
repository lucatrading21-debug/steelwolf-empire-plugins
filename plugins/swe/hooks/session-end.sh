#!/usr/bin/env bash
# SteelWolf Empire — SessionEnd hook
# Copyright © 2026 Luke SteelWolf — All Rights Reserved
#
# Triggered: Claude Code/Cowork session clean termination.
# Output appears in debug log only (NOT in context).
# Purpose: closure reminder + V1 parity verify checklist.

set -euo pipefail

DATE=$(date +"%Y-%m-%d %H:%M:%S %Z")

cat <<HOOK_OUTPUT >&2
=== SteelWolf Empire — SessionEnd Hook ===
Timestamp: ${DATE}

CHECKLIST CHIUSURA (LL-Empire binding):
- LL-Empire-018 ATOMIC COMMIT: file specifici, MAI git add -A
- LL-Empire-019 V1 PARITY VERIFY: git rev-parse HEAD == origin/<branch>
- LL-Empire-024 GATE: git status DEVE essere clean su CMD Windows
- V6 BACKUP: empire-backup.ps1 se prossima sessione filesystem-destructive

PROSSIMO STEP:
- /swe:end (closure D6 completa)
- git push origin <branch> (Luke da CMD Windows)
- git rev-parse verify

HOOK_OUTPUT

exit 0
