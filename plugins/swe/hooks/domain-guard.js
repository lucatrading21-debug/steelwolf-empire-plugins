#!/usr/bin/env node
/* SteelWolf Empire - swe guard (UserPromptSubmit).
 *
 * INVARIANTE OWNER (S189, ADR-027 §4-bis): ogni progetto SteelWolf possiede la propria scrivania e
 * la propria catena di sessioni. Una scrivania puo' aprire, ciclare e chiudere ESCLUSIVAMENTE
 * sessioni del progetto che rappresenta. L'Hub NON e' un lanciatore: `SteelWolf_Empire` apre solo
 * `predator`.
 *
 * FAIL-CLOSED sull'identita' del progetto: se non si stabilisce, o due segnali si contraddicono,
 * si rifiuta (exit 2). Mai "non riconosco, allora assumo il default". Cio' che puo' degradare e'
 * solo il livello di rendering, ed e' competenza di `session-start.js`, non di questo hook.
 *
 * Il resolver vive in `_swe-project.js` ed e' CONDIVISO con `session-start.js`: un solo resolver,
 * nessuna divergenza fra enforcement del comando e binding del briefing (CARD-08).
 *
 * Cowork (CLAUDE_CODE_IS_COWORK==="1"): niente stdin -> exit 0 no-op. Limite noto, CARD-06B.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
const fs = require("fs");
const P = require("./_swe-project.js");

function deny(msg) { process.stderr.write(msg + "\n"); process.exit(2); }

try {
  if (process.env.CLAUDE_CODE_IS_COWORK === "1") process.exit(0);
  let raw = "";
  try { raw = fs.readFileSync(0, "utf8"); } catch (_) { process.exit(0); }
  if (!raw) process.exit(0);
  let j = {}; try { j = JSON.parse(raw); } catch (_) { process.exit(0); }

  const prompt = String(j.prompt || "");
  const m = prompt.match(/^\s*\/swe:(start|end|cycle)\b\s*([^\s]+)?/i);
  if (!m) process.exit(0);                       // non e' un comando swe: non ci riguarda
  const verb = m[1].toLowerCase();
  const launched = (m[2] || "predator").toLowerCase();

  const cwd = String(j.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd() || "");
  const empireRoot = P.findEmpireRoot(cwd);
  if (!empireRoot) {
    deny("STOP swe: non trovo `_PROJECTS_INDEX.yaml` risalendo da `" + cwd + "`.\n" +
         "Senza l'indice non posso stabilire quale progetto rappresenti questa scrivania, e " +
         "l'identita' del progetto e' fail-closed (ADR-027 §4-bis).");
  }
  let projects = [];
  try { projects = P.loadProjects(empireRoot); } catch (_) { projects = []; }
  if (!projects.length) deny("STOP swe: `_PROJECTS_INDEX.yaml` illeggibile o vuoto sotto " + empireRoot);

  const target = projects.find(p => p.slug === launched);
  if (!target) {
    deny("STOP swe: `" + launched + "` non e' uno slug valido.\n" +
         "Slug ammessi: " + projects.map(p => p.slug).join(", "));
  }
  if (target.swe_writes === false) {
    deny("STOP swe: `" + launched + "` e' un dominio ESTERNO (ecosistema/piattaforma a se').\n" +
         "swe non apre sessioni qui: usa il suo strumento (plugin `nexus` per nexus, dominio WorkDASH per workdash).");
  }

  const desk = P.resolveDesk({ projects: projects, cwd: cwd, hostPaths: process.env.CLAUDE_CODE_WORKSPACE_HOST_PATHS });
  if (desk.error) {
    deny("STOP swe: " + desk.error + ".\n  cwd: " + cwd + "\n" +
         "Non apro una sessione finche' il progetto non e' univoco (ADR-027 §4-bis, fail-closed).");
  }
  if (launched !== desk.slug) {
    deny("STOP swe: sei nella scrivania del progetto `" + desk.slug + "`, ma stai aprendo `" + launched + "`.\n" +
         "Ogni progetto ha la propria scrivania e la propria catena: qui puoi solo " +
         "`/swe:" + verb + " " + desk.slug + "`.\n" +
         "Per `" + launched + "` apri la SUA scrivania. L'Hub non e' un lanciatore (ADR-027 §4-bis).");
  }
  process.exit(0);
} catch (e) {
  /* Un errore imprevisto NON puo' diventare un permesso: l'identita' e' fail-closed. */
  process.stderr.write("STOP swe: errore nel guard di dominio (" + (e && e.message ? e.message : e) + ").\n" +
                       "Per sicurezza non apro la sessione: l'identita' del progetto e' fail-closed.\n");
  process.exit(2);
}
