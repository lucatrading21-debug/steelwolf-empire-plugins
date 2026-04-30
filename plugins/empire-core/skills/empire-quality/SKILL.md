---
description: "Checklist qualita pre-commit per tutti i repo Empire. Attivare prima di ogni commit o rilascio Empire (qualsiasi repo). Contiene checklist generiche cross-repo (codice, docs, skill, git), criteri di accettazione, regole zero-regression, pre-flight check LL-Empire-018 esteso. STUB v0.1 — sezioni §3 specifiche per repo (Trading-Alliance, IronX, TA-Knowledge, TA-Academy, TA-Analysis, TA-Content) TBD da popolare in sessione dedicata futura. Trigger: /empire-core:quality oppure auto-discovery contesto pre-commit."
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE QUALITY v0.1 (STUB)

> ⚠️ **STATUS: STUB v0.1** — checklist universale §1-§4 OPERATIVA. Sezioni §3 repo-specifiche **TBD**, da popolare in sessione dedicata Tipo A futura (M2 P2 Fase 2 candidate).

> Migrata da workspace `hub/steelwolf-empire-core/skills/empire-quality/` (M2 P2 Fase 1 closure 2026-04-30 continuation S4). Body §1-§4 identico bit-per-bit al workspace originale, frontmatter adattato schema Empire plugin (no `name:` field per Issue #22063 namespace bypass enforcement).

Checklist qualita pre-commit. Attivare prima di ogni commit su qualsiasi repo Empire.

> STUB creato 16/04/2026. Da popolare con checklist specifiche in sessione dedicata tipo A.

---

## §1 — CHECKLIST PRE-COMMIT UNIVERSALE

Prima di ogni commit su qualsiasi repo Empire, verificare:

### Codice (se modificato)
- [ ] Zero errori di esecuzione/compilazione
- [ ] Zero warning
- [ ] Testato su caso base + edge case minimo
- [ ] Nessun secret/token/key nel codice committato
- [ ] .gitignore aggiornato se necessario

### Documentazione (se modificata)
- [ ] CLAUDE.md aggiornato se la modifica cambia stato/regole
- [ ] SESSION_LOG entry preparata (5 righe max)
- [ ] Nessun path stale o hash commit obsoleto nei docs
- [ ] Budget righe rispettato (CLAUDE.md, skill)

### Skill (se modificata)
- [ ] Frontmatter `description` aggiornata
- [ ] Zero riferimenti a repo specifici (se skill empire-core)
- [ ] Coerente con altre skill — nessuna contraddizione (T6 check)

### Git
- [ ] Branch corretto (dev, mai main direttamente)
- [ ] Commit message formato D8 (FEAT/FIX/DOCS: descrizione italiana)
- [ ] `git diff --stat` verificato — solo file attesi nel commit
- [ ] Nessun file .env, .key, token, secret nel diff

---

## §2 — CRITERI DI ACCETTAZIONE

Un commit e accettabile quando:
1. Passa TUTTA la checklist §1
2. Luke ha dato GO esplicito
3. Il diff e stato mostrato e approvato

---

## §3 — CHECKLIST SPECIFICHE PER REPO (TBD)

> Sezioni da popolare in sessione dedicata:

### Trading-Alliance-Bots
TBD — checklist bot Python, deploy server, journalctl

### IronX-Ecosystem
TBD — checklist MQL5 (0 errors 0 warnings), anti-repaint, zero ghost

### TA-Knowledge / TA-Academy / TA-Analysis / TA-Content
TBD — checklist contenuti, markdown, link, immagini

---

## §4 — ZERO REGRESSION RULE

**MAI introdurre una regressione per risolvere un problema diverso.**

Se un fix rompe qualcos'altro:
1. Revert immediato
2. Documentare in LESSONS_LEARNED
3. Riaprire con approccio diverso in sessione successiva
