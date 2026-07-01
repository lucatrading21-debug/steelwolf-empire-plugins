#!/usr/bin/env node
/* SteelWolf Empire - Forced-eval UserPromptSubmit hook (Node exec form).
 * NON cablato in hooks.json di default (scelta Luke). Guard di dominio.
 * Stdout iniettato ad OGNI prompt se attivato. Copyright (c) 2026 Luke SteelWolf. */
if (!require("./_swe-domain.js")()) process.exit(0);
console.log(`=== SteelWolf Empire - Skill Activation Forced Evaluation ===

OBBLIGATORIO prima di rispondere al prompt utente:

STEP 1 - EVALUATE (per ogni skill plugin swe disponibile):
  - swe:start (apertura sessione Empire) - YES/NO + reason
  - swe:end (chiusura D6) - YES/NO + reason
  - swe:compact (compact mid-session) - YES/NO + reason

STEP 2 - ACTIVATE:
  Se almeno una skill = YES -> invoca skill PRIMA di proseguire.

STEP 3 - IMPLEMENT:
  Solo dopo Step 1+2 -> procedi con richiesta utente.

REGOLE BINDING (LL-Empire):
- LL-Empire-002 PROTOCOLLO GO
- LL-Empire-008 VERIFICA EMPIRICA
- LL-Empire-023 PULL-FIRST`);
process.exit(0);
