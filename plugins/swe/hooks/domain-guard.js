#!/usr/bin/env node
/* SteelWolf Empire - swe domain-isolation guard (UserPromptSubmit).
 * Blocca /swe:start|end|cycle <slug-dominio-autonomo> (swe_writes:false in _PROJECTS_INDEX.yaml).
 * Design S164 (ricerca hooks Anthropic + LL-060/S159):
 *  - Cowork (CLAUDE_CODE_IS_COWORK==="1"): NON legge stdin (in Cowork puo' bloccare) -> exit 0 no-op;
 *    copre il guard-prosa hard-stop di start/end/cycle (SKILL §0-ter.5).
 *  - CLI: legge il JSON su stdin (spec: campo `prompt`) e su match -> exit 2 (rifiuta il prompt).
 *  - Qualsiasi errore/stdin vuoto -> exit 0 (fail-open sicuro: mai bloccare sessioni legittime).
 * Slug autonomi tenuti in sync con _PROJECTS_INDEX.yaml (swe_writes:false).
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
try {
  if (process.env.CLAUDE_CODE_IS_COWORK === "1") process.exit(0); // Cowork: no stdin, no-op
  let raw = "";
  try { raw = require("fs").readFileSync(0, "utf8"); } catch (_) { process.exit(0); }
  if (!raw) process.exit(0);
  let prompt = "";
  try { prompt = (JSON.parse(raw).prompt || ""); } catch (_) { process.exit(0); }
  const AUTONOMOUS = ["bot-alliance", "nexus", "workdash"]; // == swe_writes:false
  const re = new RegExp("^\\s*/swe:(start|end|cycle)\\s+(" + AUTONOMOUS.join("|") + ")\\b", "i");
  const m = prompt.match(re);
  if (!m) process.exit(0);
  const slug = m[2].toLowerCase();
  process.stderr.write(
    "⛔ swe domain-isolation: `" + slug + "` e' un dominio autonomo. `swe` non apre/chiude/cicla sessioni qui " +
    "(domain-isolation LL-050 + decisione #3 S163). Apri la sessione dal dominio proprietario " +
    "(scrivania Bot-Alliance per bot-alliance, plugin `nexus` per nexus, dominio WorkDASH per workdash).\n"
  );
  process.exit(2);
} catch (_) { process.exit(0); }
