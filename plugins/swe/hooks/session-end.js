#!/usr/bin/env node
/* SteelWolf Empire - SessionEnd hook (Node exec form, Windows-safe).
 * Output su stderr (solo debug log, NON contesto). Guard di dominio.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
if (!require("./_swe-domain.js")()) process.exit(0);
const ts = new Date().toISOString();
console.error(`=== SteelWolf Empire - SessionEnd Hook ===
Timestamp: ${ts}

CHECKLIST CHIUSURA (LL-Empire binding):
- LL-Empire-018 ATOMIC COMMIT: file specifici, MAI git add -A
- LL-Empire-019 V1 PARITY VERIFY: git rev-parse HEAD == origin/<branch>
- LL-Empire-024 GATE: git status DEVE essere clean su CMD Windows
- V6 BACKUP: empire-backup.ps1 se prossima sessione filesystem-destructive

PROSSIMO STEP:
- /swe:end (closure D6 completa)
- git push origin <branch> (Luke da CMD Windows)
- git rev-parse verify`);
process.exit(0);
