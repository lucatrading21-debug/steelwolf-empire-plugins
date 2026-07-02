#!/usr/bin/env node
/* SteelWolf Empire - swe guard (UserPromptSubmit). Due controlli:
 *  (1) DOMINIO ESTERNO: /swe:start|end|cycle <nexus|workdash> -> blocca (swe_writes:false, repo:null).
 *  (2) COERENZA SCRIVANIA<->PROGETTO (S166, Opzione B): la sessione aperta deve combaciare con la
 *      cartella-progetto corrente. Scrivania-progetto X + apri Y (o hub default) -> blocca.
 *      Hub (radice empire) = lanciatore: apre predator o qualsiasi progetto -> consenti.
 * Design S164/S166 (ricerca hooks Anthropic: cwd + prompt + exit 2 = rifiuta prompt; LL-060/S159):
 *  - Cowork (CLAUDE_CODE_IS_COWORK==="1"): niente stdin -> exit 0 no-op; copre il guard-prosa §0-ter.
 *  - CLI: legge JSON stdin (campi `prompt`, `cwd`) -> su violazione exit 2 (rifiuta ed erase il prompt).
 *  - Qualsiasi errore / non riconosciuto -> exit 0 (FAIL-OPEN: mai bloccare sessioni legittime).
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
try {
  if (process.env.CLAUDE_CODE_IS_COWORK === "1") process.exit(0); // Cowork: no stdin, no-op
  let raw = "";
  try { raw = require("fs").readFileSync(0, "utf8"); } catch (_) { process.exit(0); }
  if (!raw) process.exit(0);
  let j = {}; try { j = JSON.parse(raw); } catch (_) { process.exit(0); }
  const prompt = String(j.prompt || "");
  const cwd = String(j.cwd || process.env.CLAUDE_PROJECT_DIR || "");

  const m = prompt.match(/^\s*\/swe:(start|end|cycle)\b\s*([^\s]+)?/i);
  if (!m) process.exit(0);
  const launched = (m[2] || "predator").toLowerCase();

  // (1) domini ESTERNI (repo:null): swe non li gestisce mai
  const EXTERNAL = ["nexus", "workdash"];
  if (EXTERNAL.includes(launched)) {
    process.stderr.write(
      "⛔ swe: `" + launched + "` e' un dominio ESTERNO (ecosistema/piattaforma a se'). " +
      "swe non apre sessioni qui: usa il suo strumento (plugin `nexus` per nexus, dominio WorkDASH per workdash).\n"
    );
    process.exit(2);
  }

  // (2) coerenza scrivania<->progetto (basename repo nel cwd)
  const REPO2SLUG = {
    "trading-alliance-bots": "bot-alliance",
    "steelwolf-trading-journal": "steelwolf-trading-journal",
    "ta-analysis": "ta-analysis",
    "ta-academy": "ta-academy",
    "ta-knowledge": "ta-knowledge",
    "ta-content": "ta-content",
  };
  const segs = cwd.split(/[\\/]+/).filter(Boolean);
  let current = null;
  for (const s of segs) { if (REPO2SLUG[s]) { current = REPO2SLUG[s]; break; } }
  if (!current) {
    // nessun repo-progetto nel path: se sei nell'empire root/hub -> Hub (lanciatore, consenti tutto)
    if (segs.includes("SteelWolf_Empire") || segs.includes("steelwolf-empire-hub")) process.exit(0);
    process.exit(0); // path non riconosciuto -> FAIL-OPEN
  }
  // sei in una scrivania-progetto: puoi aprire SOLO quel progetto
  if (launched !== current) {
    process.stderr.write(
      "⛔ swe coerenza: sei nella scrivania del progetto `" + current + "`, ma stai aprendo `" + launched + "`.\n" +
      "Qui puoi aprire SOLO `" + current + "` con `/swe:" + m[1] + " " + current + "`.\n" +
      "Per `" + launched + "` apri la sua scrivania (o l'Hub SteelWolf per i progetti senza scrivania).\n"
    );
    process.exit(2);
  }
  process.exit(0);
} catch (_) { process.exit(0); }
