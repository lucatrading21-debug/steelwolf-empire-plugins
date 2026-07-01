#!/usr/bin/env node
/* SteelWolf Empire - SessionStart hook (Node, cross-platform, exec form).
 * Stdout is injected into context (Anthropic 2026 spec). No bash dependency
 * (Windows-safe: avoids Git-Bash/PowerShell fallback). No stdin read.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
const projectDir = process.env.CLAUDE_PROJECT_DIR || "unset";
const cwd = process.cwd();

// --- SWE-PROBE v2 (temporaneo S159: caccia discriminatore dominio) ---
console.log("=== SWE-PROBE ===");
console.log("CLAUDE_PROJECT_DIR=" + projectDir);
console.log("CWD=" + cwd);
try {
  const env = process.env;
  const rx = /steelwolf|empire|workspace|space|mount|folder|project|cowork|nexus|selected|root/i;
  const hits = Object.entries(env)
    .filter(([k,v]) => rx.test(k) || /steelwolf|empire/i.test(String(v)))
    .map(([k,v]) => k + "=" + v);
  console.log("ENV-HITS(" + hits.length + "):");
  for (const h of hits) console.log("  " + h);
  console.log("ALL-ENV-KEYS: " + Object.keys(env).sort().join(","));
} catch (e) { console.log("PROBE-ERR: " + e.message); }
console.log("=== /SWE-PROBE ===");
console.log("");

console.log(`=== STEELWOLF EMPIRE - SESSION OPEN ===
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
=== END SESSION OPEN ===`);
process.exit(0);
