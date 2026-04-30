---
description: Empire quality checklist pre-commit cross-repo. Esegue checklist universale §1 (codice, docs, skill, git), criteri accettazione §2, sezioni repo-specifiche §3 (TBD STUB v0.1 per Trading-Alliance/IronX/TA-*), zero-regression rule §4. Skill empire-quality binding LL-Empire-018/022/023.
argument-hint: [repo-target-opzionale]
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui workflow quality checklist Empire seguendo skill `empire-quality` plugin empire-core
in `skills/empire-quality/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria pre-commit

1. **Checklist §1 universale** — Codice (zero errori/warning, edge case, no secrets, .gitignore), Documentazione (CLAUDE.md updated, SESSION_LOG entry, no path stale), Skill (frontmatter description aggiornata, no riferimenti repo specifici se empire-core, T6 cross-skill check), Git (branch dev, commit message D8 FEAT/FIX/DOCS, `git diff --stat` verificato, no .env/.key/token).

2. **Criteri accettazione §2** — Passa TUTTA checklist §1 + Luke ha dato GO esplicito + diff mostrato e approvato.

3. **Sezioni repo-specifiche §3** (se repo target = Trading-Alliance / IronX / TA-Knowledge / TA-Academy / TA-Analysis / TA-Content): vedi TBD STUB v0.1 per checklist specifiche. M2 P2 Fase 2 candidate.

4. **Zero-regression rule §4** — MAI introdurre regressione per risolvere problema diverso. Se fix rompe altro: revert immediato, documentare LESSONS_LEARNED, riapri sessione successiva con approccio diverso.

5. **Pre-flight check LL-Empire-018 esteso** (per file `.cmd/.ps1/.sh/.json`):
   - JSON: `python3 -m json.tool < file` exit 0
   - File: `file <path>` line endings corretti (CRLF Windows scripts, LF Unix scripts)
   - ASCII: `grep -P "[^\x00-\x7F]" <path>` VUOTO (zero non-ASCII)
   - Bash: `bash -n <script>` exit 0 (syntax valid)
   - PS1: `grep -nE '\$[A-Za-z_][A-Za-z0-9_]*:' <path>` VUOTO (no `$Var:` drive-scoped)

Argomento opzionale `$1`: repo target (es. `trading-alliance-bots`, `ironx-ecosystem`).

## Regole binding

- Mai bypass checklist anche per fix urgenti
- Pre-flight check obbligatorio per ogni file `.cmd/.ps1/.sh/.json` post-Write Cowork
- LL-Empire-022 untracked dirs checklist 5-step Git operations
- LL-Empire-023 pull-first protocol PRIMA di qualsiasi edit

LL critiche binding: 018 (file gen pre-flight), 019 (Git lock cleanup), 022 (untracked dirs), 023 (pull-first), 025 (schema autoritativo)
